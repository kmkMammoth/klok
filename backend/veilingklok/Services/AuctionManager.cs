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

    public class AuctionManager : IAuctionManager
    {
private static readonly System.Collections.Concurrent.ConcurrentDictionary<int, System.Threading.SemaphoreSlim> _productLocks = new();
        private readonly VeilingContext _db;
        private readonly IHubContext<AuctionHub> _hub;
        private readonly IServiceScopeFactory _scopeFactory;

        public AuctionManager(VeilingContext db, IHubContext<AuctionHub> hub, IServiceScopeFactory scopeFactory)
        {
            _db = db;
            _hub = hub;
            _scopeFactory = scopeFactory;
        }

        public async Task StartAuctionAsync(int veilingId)
        {
            var veiling = await _db.Veiling.FindAsync(veilingId);
            if (veiling == null) return;

            // Start auction using UTC times
            var duration = veiling.EindTijd - veiling.StartTijd;
            veiling.StartTijd = DateTime.UtcNow;
            veiling.EindTijd = veiling.StartTijd.Add(duration);
            veiling.Status = "Ongoing";
            await _db.SaveChangesAsync();

            await _hub.Clients.Group($"auction-{veilingId}")
                .SendAsync("AuctionStarted", new { auctionId = veilingId, startedAtUtc = veiling.StartTijd });

            // Start first product
            await StartNextProductAsync(veilingId);
        }

        public async Task StartNextProductAsync(int veilingId)
        {
            // find next unsold product without StartedAt
            var next = await _db.Product
                .Where(p => p.VeilingId == veilingId && p.gebruiker_id == null && p.Status != "GEKOCHT" && p.StartedAtUtc == null)
                .OrderBy(p => p.ArtikelId)
                .FirstOrDefaultAsync();

            if (next == null)
            {
                // No more products; end auction
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

            next.StartedAtUtc = DateTime.UtcNow;
            next.Status = "RUNNING";
            await _db.SaveChangesAsync();

            await _hub.Clients.Group($"auction-{veilingId}")
                .SendAsync("ProductStarted", new { productId = next.ArtikelId, startedAtUtc = next.StartedAtUtc, auctionId = veilingId, startPrice = next.StartPrijs, incrementPerSecond = next.IncrementPerSecond, minimumPrice = next.MinimumPrijs });

            // Schedule automatic expiry when price reaches minimum (if applicable)
            try
            {
                var startPrice = next.StartPrijs ?? 0m;
                var minPrice = next.MinimumPrijs ?? 0m;
                var increment = next.IncrementPerSecond ?? 0m;

                if (increment > 0 && startPrice > minPrice)
                {
                    var secondsUntilMin = (double)((startPrice - minPrice) / increment);
                    var ms = (int)Math.Ceiling(secondsUntilMin * 1000);
                    _ = ExpireProductAfterDelayAsync(next.ArtikelId, ms, next.StartedAtUtc.Value, veilingId);
                }
            }
            catch
            {
                // Best-effort; do not throw if scheduling fails
            }
        }

        private async Task ExpireProductAfterDelayAsync(int productId, int delayMs, DateTime startedAtUtc, int veilingId)
        {
            // Run on background thread and create a new scope to access DB safely
            await Task.Delay(delayMs);

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<VeilingContext>();
                var hub = scope.ServiceProvider.GetRequiredService<IHubContext<AuctionHub>>();
                var mgr = scope.ServiceProvider.GetRequiredService<IAuctionManager>();

                var p = await db.Product.SingleOrDefaultAsync(x => x.ArtikelId == productId);
                if (p == null) return;

                // Ensure nothing changed: still running, unsold, and same start time
                if (p.Status == "RUNNING" && string.IsNullOrEmpty(p.gebruiker_id) && p.StartedAtUtc.HasValue && p.StartedAtUtc.Value == startedAtUtc)
                {
                    // mark as discarded/expired
                    p.Status = "VERWORPEN"; // discarded
                    await db.SaveChangesAsync();

                    await hub.Clients.Group($"auction-{veilingId}")
                        .SendAsync("ProductExpired", new { productId = p.ArtikelId, expiredAtUtc = DateTime.UtcNow });

                    // start next product (if any)
                    await mgr.StartNextProductAsync(veilingId);
                }
            }
            catch
            {
                // swallow - non-critical
            }
        }
        public async Task<bool> TryBuyProductAsync(int productId, string buyerId, int hoeveelheid = 1, decimal? offeredPrice = null)
        {
            // Use per-product semaphore to prevent concurrent buys in-memory and allow async/await within critical section
            var sem = _productLocks.GetOrAdd(productId, _ => new System.Threading.SemaphoreSlim(1,1));
            await sem.WaitAsync();
            try
            {
                // Requery database state (async) to avoid stale data in concurrent contexts
                var current = await _db.Product.AsNoTracking().SingleOrDefaultAsync(p => p.ArtikelId == productId);
                if (current == null) return false;

                // Determine available quantity (treat null as 1)
                var available = current.Hoeveelheid ?? 1;
                if (available <= 0) return false;

                if (hoeveelheid <= 0) return false;

                if (hoeveelheid > available) return false; // cannot buy more than available

                // If product already fully assigned to a buyer, reject
                if (!string.IsNullOrEmpty(current.gebruiker_id)) return false; // already sold

                if (current.VeilingId.HasValue)
                {
                    var veiling = await _db.Veiling.FindAsync(current.VeilingId.Value);
                    if (veiling == null) return false;
                    if (veiling.Status != "Ongoing") return false;
                    if (DateTime.UtcNow > veiling.EindTijd) return false;
                }

                // Fetch tracked entity to update (or find and attach)
                var product = await _db.Product.FindAsync(productId);
                if (product == null) return false;

                // Ensure product has started
                if (!product.StartedAtUtc.HasValue)
                {
                    // Start it immediately
                    product.StartedAtUtc = DateTime.UtcNow;
                }

                // calculate price (per-unit)
                var elapsed = (DateTime.UtcNow - product.StartedAtUtc.Value).TotalSeconds;
                var startPrice = product.StartPrijs ?? 0m;
                var increment = product.IncrementPerSecond ?? 0m;
                var minPrice = product.MinimumPrijs ?? 0m;

                var newPrice = startPrice - (decimal)elapsed * increment;
                if (newPrice < minPrice) newPrice = minPrice;

                // Create a GekochtProduct record for this purchase
                var gekocht = new GekochtProduct
                {
                    ProductId = product.ArtikelId,
                    GebruikerId = buyerId,
                    Hoeveelheid = hoeveelheid,
                    KoopPrijs = offeredPrice ?? newPrice
                };

                _db.GekochtProduct.Add(gekocht);

                // Decrement available quantity
                var remaining = (product.Hoeveelheid ?? 1) - hoeveelheid;
                product.Hoeveelheid = remaining;

                // If this purchase exhausts the product, mark it sold
                var fullySold = remaining <= 0;
                if (fullySold)
                {
                    product.gebruiker_id = buyerId;
                    product.Status = "GEKOCHT";
                    product.KoopPrijs = offeredPrice ?? newPrice;
                }

                try
                {
                    await _db.SaveChangesAsync();

                    // Broadcast sale only when fully sold; otherwise broadcast an update so clients can refresh quantities
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
                    // concurrency conflict => someone bought first
                    return false;
                }

                // Start next product only if this product was fully sold
                if (product.VeilingId.HasValue && fullySold)
                {
                    // Start next product without blocking the caller for long - run asynchronously using a new scope so we don't access a disposed DbContext
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
                sem.Release();
            }
        }
    }
}
