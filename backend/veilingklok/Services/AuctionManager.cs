using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using veilingklok.Hubs;
using veilingklok.Models;

namespace veilingklok.Services
{
    public interface IAuctionManager
    {
        Task StartAuctionAsync(int veilingId);
        // Try to buy a given hoeveelheid of the product. Returns true when the purchase succeeded.
        // `hoeveelheid` defaults to 1 for backward compatibility. `offeredPrice` is optional.
        Task<bool> TryBuyProductAsync(int productId, string buyerId, int hoeveelheid = 1, decimal? offeredPrice = null);
        Task StartNextProductAsync(int veilingId);
    }

    /// <summary>
    /// Orchestreert de veilingcyclus: start veilingen, beheert productsequencing, 
    /// handelt aankopen af met optimistic concurrency, en plant automatische vervalling.
    /// </summary>
    public class AuctionManager : IAuctionManager
    {
        /// <summary>
        /// Per-product semaphore-locks voor synchrone aankoopaccesscontrol.
        /// Voorkomt gelijktijdige purchases op hetzelfde product in-memory.
        /// </summary>
        private static readonly System.Collections.Concurrent.ConcurrentDictionary<int, System.Threading.SemaphoreSlim> _productLocks = new();
        
        private readonly VeilingContext _db;
        private readonly IHubContext<AuctionHub> _hub;  // SignalR hub voor live broadcasts
        private readonly IServiceScopeFactory _scopeFactory;  // Factory voor background task DB-scopes

        public AuctionManager(VeilingContext db, IHubContext<AuctionHub> hub, IServiceScopeFactory scopeFactory)
        {
            _db = db;
            _hub = hub;
            _scopeFactory = scopeFactory;
        }

        /// <summary>
        /// Start veilingafloop: zet status naar "Ongoing" en stelt UTC-start-/eindtijden in.
        /// Broadcast 'AuctionStarted' event en trigger automatisch eerste product.
        /// </summary>
        public async Task StartAuctionAsync(int veilingId)
        {
            var veiling = await _db.Veiling.FindAsync(veilingId);
            if (veiling == null) return;

            // Zet veilingtijden op server-UTC nu (behoudt duur).
            // Dit synchroniseert met serverclock voor prijsberekening op cliënt.
            var duration = veiling.EindTijd - veiling.StartTijd;
            veiling.StartTijd = DateTime.UtcNow;
            veiling.EindTijd = veiling.StartTijd.Add(duration);
            veiling.Status = "Ongoing";
            await _db.SaveChangesAsync();

            // Broadcast veilingstart naar alle connected clients in groep.
            await _hub.Clients.Group($"auction-{veilingId}")
                .SendAsync("AuctionStarted", new { auctionId = veilingId, startedAtUtc = veiling.StartTijd });

            // Start eerste product.
            await StartNextProductAsync(veilingId);
        }

        /// <summary>
        /// Selecteert en start het volgende onverkochte product (FIFO op ArtikelId).
        /// Zet StartedAtUtc (voor prijsberekening), stelt Status="RUNNING",
        /// broadcast ProductStarted, en plant automatische vervalling.
        /// </summary>
        public async Task StartNextProductAsync(int veilingId)
        {
            // Selecteer volgende onverkochte product (niet gestart, niet verkocht, niet verlopen).
            var next = await _db.Product
                .Where(p => p.VeilingId == veilingId && p.gebruiker_id == null && p.Status != "GEKOCHT" && p.StartedAtUtc == null)
                .OrderBy(p => p.ArtikelId)
                .FirstOrDefaultAsync();

            if (next == null)
            {
                // Geen producten meer: einde veiling.
                var veiling = await _db.Veiling.FindAsync(veilingId);
                if (veiling != null)
                {
                    veiling.Status = "Done";
                    await _db.SaveChangesAsync();
                    await _hub.Clients.Group($"auction-{veilingId}")
                        .SendAsync("AuctionEnded", new { auctionId = veilingId });
                }
                return;
            }

            // Zet startmoment op server-UTC nu (cruciaal voor client-prijsberekening).
            next.StartedAtUtc = DateTime.UtcNow;
            next.Status = "RUNNING";
            await _db.SaveChangesAsync();

            // Broadcast ProductStarted naar cliënten; bevat startprijs en decrement-snelheid.
            // Cliënten gebruiken deze voor lokale prijsweergave via offset-synchronisatie.
            await _hub.Clients.Group($"auction-{veilingId}")
                .SendAsync("ProductStarted", new { productId = next.ArtikelId, startedAtUtc = next.StartedAtUtc, auctionId = veilingId, startPrice = next.StartPrijs, incrementPerSecond = next.IncrementPerSecond, minimumPrice = next.MinimumPrijs });

            // Plan automatische vervalling wanneer prijs minimumwaarde bereikt.
            // Deze taak draait op background thread om clients niet te blokkeren.
            try
            {
                var startPrice = next.StartPrijs ?? 0m;
                var minPrice = next.MinimumPrijs ?? 0m;
                var increment = next.IncrementPerSecond ?? 0m;

                // Bereken aantal seconden tot minimumprijs bereikt.
                if (increment > 0 && startPrice > minPrice)
                {
                    var secondsUntilMin = (double)((startPrice - minPrice) / increment);
                    var ms = (int)Math.Ceiling(secondsUntilMin * 1000);
                    _ = ExpireProductAfterDelayAsync(next.ArtikelId, ms, next.StartedAtUtc.Value, veilingId);
                }
            }
            catch
            {
                // Best-effort: geen fout bij scheduling (geen blokkade voor clients).
            }
        }

        /// <summary>
        /// Background-taak voor automatische vervalling: wacht tot minimumprijs bereikt,
        /// markeert product als "VERWORPEN", broadcast event, trigger volgende product.
        /// </summary>
        private async Task ExpireProductAfterDelayAsync(int productId, int delayMs, DateTime startedAtUtc, int veilingId)
        {
            // Wacht totdat minimumprijs tijd verstreken is (non-blocking async).
            await Task.Delay(delayMs);

            try
            {
                // Maak nieuwe scope: background task moet fresh DB-context hebben.
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<VeilingContext>();
                var hub = scope.ServiceProvider.GetRequiredService<IHubContext<AuctionHub>>();
                var mgr = scope.ServiceProvider.GetRequiredService<IAuctionManager>();

                var p = await db.Product.SingleOrDefaultAsync(x => x.ArtikelId == productId);
                if (p == null) return;

                // Dubbel-check product nog niet verkocht en startmoment ongewijzigd
                // (voorkoming van race condition tussen taak en aankoop).
                if (p.Status == "RUNNING" && string.IsNullOrEmpty(p.gebruiker_id) && p.StartedAtUtc.HasValue && p.StartedAtUtc.Value == startedAtUtc)
                {
                    // Mark product as "VERWORPEN" (verlopen).
                    p.Status = "VERWORPEN";
                    await db.SaveChangesAsync();

                    // Notify cliënten dat product verlopen is.
                    await hub.Clients.Group($"auction-{veilingId}")
                        .SendAsync("ProductExpired", new { productId = p.ArtikelId, expiredAtUtc = DateTime.UtcNow });

                    // Auto-start volgende product (lifecycle voort).
                    await mgr.StartNextProductAsync(veilingId);
                }
            }
            catch
            {
                // Swallow: non-critical background taak; geen blokkade voor cliënten.
            }
        }
        /// <summary>
        /// Probeert product(en) te kopen: handelt meerdere stuks af (deelverpakking),
        /// berekent prijs via server-authoriteit, maakt GekochtProduct aan,
        /// en triggert volgende product als volledig verkocht.
        /// 
        /// Concurrency-strategie:
        /// - Per-product semaphore: één-enige in-memory critical section per artikel.
        /// - Optimistic concurrency: RowVersion op database voor detectie van conflicten.
        /// </summary>
        public async Task<bool> TryBuyProductAsync(int productId, string buyerId, int hoeveelheid = 1, decimal? offeredPrice = null)
        {
            // Per-product semaphore: syncroniseert gelijktijdige aankopen op hetzelfde artikel.
            // Voorkomt race conditions in-memory (bijv. dubbele hoeveelheid-check).
            var sem = _productLocks.GetOrAdd(productId, _ => new System.Threading.SemaphoreSlim(1,1));
            await sem.WaitAsync();
            try
            {
                // Herquery database-staat (AsNoTracking): voorkoming van stale data in gelijktijdige context.
                // Eerste check alleen voor snelle validatie; latere Fetch() brengt entiteit in context.
                var current = await _db.Product.AsNoTracking().SingleOrDefaultAsync(p => p.ArtikelId == productId);
                if (current == null) return false;

                // Bepaal beschikbare hoeveelheid (null behandelen als 1).
                var available = current.Hoeveelheid ?? 1;
                if (available <= 0) return false;

                if (hoeveelheid <= 0) return false;

                if (hoeveelheid > available) return false; // Niet meer kopen dan beschikbaar.

                // Check: product niet al volledig aan koper toegewezen.
                if (!string.IsNullOrEmpty(current.gebruiker_id)) return false; // Reeds verkocht.

                // Valideer veiling-status als product aan veiling toegewezen.
                if (current.VeilingId.HasValue)
                {
                    var veiling = await _db.Veiling.FindAsync(current.VeilingId.Value);
                    if (veiling == null) return false;
                    if (veiling.Status != "Ongoing") return false;
                    if (DateTime.UtcNow > veiling.EindTijd) return false;  // Veiling verlopen.
                }

                // Fetch tracked entiteit voor update (kan nu veilig aanpassen).
                var product = await _db.Product.FindAsync(productId);
                if (product == null) return false;

                // Zet startmoment indien nog niet gestart (fallback).
                if (!product.StartedAtUtc.HasValue)
                {
                    product.StartedAtUtc = DateTime.UtcNow;
                }

                // **Prijsberekening**: Server-authoriteit via lineaire prijsdaling.
                // Formule: prijs = startPrijs - (nu - startMoment) * increment
                // Prijs kan niet lager dan minimumPrijs gaan.
                var elapsed = (DateTime.UtcNow - product.StartedAtUtc.Value).TotalSeconds;
                var startPrice = product.StartPrijs ?? 0m;
                var increment = product.IncrementPerSecond ?? 0m;
                var minPrice = product.MinimumPrijs ?? 0m;

                var newPrice = startPrice - (decimal)elapsed * increment;
                if (newPrice < minPrice) newPrice = minPrice;

                // **GekochtProduct**: Registreer aankoop incl. hoeveelheid en prijs.
                // Dit record dient als audit trail van transactie.
                var gekocht = new GekochtProduct
                {
                    ProductId = product.ArtikelId,
                    GebruikerId = buyerId,
                    Hoeveelheid = hoeveelheid,
                    KoopPrijs = offeredPrice ?? newPrice,
                    KoopDatum = DateTime.UtcNow
                };

                _db.GekochtProduct.Add(gekocht);

                // Decrement beschikbare hoeveelheid na dit aankoop.
                var remaining = (product.Hoeveelheid ?? 1) - hoeveelheid;
                product.Hoeveelheid = remaining;

                // Check of product nu volledig verkocht is (resterende hoeveelheid <= 0).
                var fullySold = remaining <= 0;
                if (fullySold)
                {
                    // Product volledig weg: zet eindstatus, markeer koper, sla prijs op.
                    product.gebruiker_id = buyerId;
                    product.Status = "GEKOCHT";
                    product.KoopPrijs = offeredPrice ?? newPrice;
                }

                try
                {
                    // **SaveChanges**: Optimistic concurrency check via RowVersion.
                    // Indien conflict (iemand ander kocht gelijktijdig): catch exception en return false.
                    await _db.SaveChangesAsync();

                    // **Broadcasting**: Afhankelijk of volledig verkocht of partieel.
                    // - ProductSold (volledig): trigger volgende product.
                    // - ProductUpdated (partieel): clients kunnen hoeveelheid verversen.
                    if (fullySold)
                    {
                        await _hub.Clients.Group($"auction-{product.VeilingId}")
                            .SendAsync("ProductSold", new { productId = product.ArtikelId, buyerId = buyerId, price = (offeredPrice ?? newPrice), soldAtUtc = DateTime.UtcNow });
                    }
                    else
                    {
                        await _hub.Clients.Group($"auction-{product.VeilingId}")
                            .SendAsync("ProductUpdated", new { productId = product.ArtikelId, remaining = product.Hoeveelheid });
                    }
                }
                catch (DbUpdateConcurrencyException)
                {
                    // Concurrency-conflict: iemand ander kocht gelijktijdig (RowVersion gewijzigd).
                    // Return false; client kan opnieuw proberen.
                    return false;
                }

                // **Volgende product**: Trigger alleen als dit product volledig verkocht EN aan veiling toegewezen.
                // Async zonder blokkade: background taak met nieuwe scope.
                if (product.VeilingId.HasValue && fullySold)
                {
                    // Nieuwe scope: background task kan disposed DbContext niet hergebruiken.
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            using var scope = _scopeFactory.CreateScope();
                            var mgr = scope.ServiceProvider.GetRequiredService<IAuctionManager>();
                            await mgr.StartNextProductAsync(product.VeilingId.Value);
                        }
                        catch { /* swallow */ }
                    });
                }

                return true;
            }
            finally
            {
                sem.Release();  // Geef semaphore vrij voor volgende aankoop.
            }
        }
    }
}
