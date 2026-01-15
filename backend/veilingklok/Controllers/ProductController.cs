using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using veilingklok.Models;
using veilingklok.Services;
using System.Reflection;

namespace veilingklok;

/// <summary>
/// Request body voor het aanmaken of bijwerken van een product.
/// Inclusief optionele veilingvelden zodat reusability behouden blijft.
/// </summary>
public class CreateProductRequest
{
    public string? soort { get; set; }
    public int? potmaat { get; set; }
    public decimal? steellengte { get; set; }
    public int? hoeveelheid { get; set; }
    public decimal? minimumprijs { get; set; }
    public string? kloklokatie { get; set; }
    public string? afbeelding { get; set; }

    // optional auction-related fields
    public decimal? startprijs { get; set; }
    public decimal? incrementPerSecond { get; set; }
}

/// <summary>
/// Request body voor veilingkoppeling: bevat doelveiling en facultatieve prijsinstellingen.
/// </summary>
public class UpdateProductVeiling
{
    public int? veilingId { get; set; }
    public decimal? startprijs { get; set; }
    public decimal? incrementPerSecond { get; set; }
}
/// <summary>
/// Request body voor koppelen van koper aan product (buiten veilingflow om).
/// </summary>
public class UpdateProductKoper
{
    public string? koperId { get; set; }
}

/// <summary>
/// Beperkte statusweergave van een product (id + status).
/// </summary>
public class ProductStatusResponse
{
    public int id { get; set; }
    public string? status { get; set; }
}

/// <summary>
/// REST-response voor productoverzichten: combineert product-, veiling- en koopinfo.
/// </summary>
public class ProductResponse
{
    public int id { get; set; }
    public string? soort { get; set; }
    public int? potmaat { get; set; }
    public decimal? steellengte { get; set; }
    public int? hoeveelheid { get; set; }
    public decimal? minimumprijs { get; set; }
    public string? kloklokatie { get; set; }
    public string? afbeelding { get; set; }
    public string? gebruiker_id { get; set; }

    // auction-related fields
    public decimal? startprijs { get; set; }
    public decimal? incrementPerSecond { get; set; }
    public string? startedAtUtc { get; set; }
    public decimal? koopprijs { get; set; }

    // Reference to assigned auction (nullable)
    public int? veilingId { get; set; }
    public string? koperId { get; set; }
    public string? status { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    // DbContext + AuctionManager worden via DI aangeleverd.
    private readonly VeilingContext _db;
    private readonly IAuctionManager _auctionManager;

    public ProductsController(VeilingContext db, IAuctionManager auctionManager)
    {
        _db = db;
        _auctionManager = auctionManager;
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Aanvoerder, Koper, Admin, Veilingmeester")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProducts([FromQuery] int? veilingId)
    {
        // Optionele filter op veilingId voor scoped ophalen.
        var query = _db.Product.AsQueryable();
        if (veilingId.HasValue)
        {
            query = query.Where(p => p.VeilingId == veilingId.Value);
        }

        var producten = await query
            .OrderBy(p => p.ArtikelId)
            .ToListAsync();

        var responses = producten.Select(p => new ProductResponse
        {
            id = p.ArtikelId,
            soort = p.Soort,
            potmaat = p.Potmaat,
            steellengte = p.Steellengte,
            hoeveelheid = p.Hoeveelheid,
            minimumprijs = p.MinimumPrijs,
            kloklokatie = p.KlokLocatie,
            afbeelding = p.Afbeelding,
            gebruiker_id = p.Gebruiker_id,
            startprijs = p.StartPrijs,
            incrementPerSecond = p.IncrementPerSecond,
            startedAtUtc = p.StartedAtUtc.HasValue ? p.StartedAtUtc.Value.ToString("o") : null,
            koopprijs = p.KoopPrijs,
            veilingId = p.VeilingId,
            koperId = p.gebruiker_id,
            status = p.Status
        }).ToList();

        return Ok(responses);
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Aanvoerder, Koper, Veilingmeester")]
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> GetProduct(int id)
    {
        // Ophalen enkelvoudig product met exact ID; single-or-default om 404 te kunnen geven.
        var product = await _db.Product
            .Where(p => p.ArtikelId == id)
            .SingleOrDefaultAsync();

        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        var response = new ProductResponse
        {
            id = product.ArtikelId,
            soort = product.Soort,
            potmaat = product.Potmaat,
            steellengte = product.Steellengte,
            hoeveelheid = product.Hoeveelheid,
            minimumprijs = product.MinimumPrijs,
            kloklokatie = product.KlokLocatie,
            afbeelding = product.Afbeelding,
            gebruiker_id = product.Gebruiker_id,
            startprijs = product.StartPrijs,
            incrementPerSecond = product.IncrementPerSecond,
            startedAtUtc = product.StartedAtUtc.HasValue ? product.StartedAtUtc.Value.ToString("o") : null,
            koopprijs = product.KoopPrijs,
            veilingId = product.VeilingId,
            koperId = product.gebruiker_id,
            status = product.Status
        };

        return Ok(response);
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Aanvoerder, Koper, Veilingmeester")]
    [HttpGet("{id}/status")]
    public async Task<ActionResult<ProductStatusResponse>> GetProductStatus(int id)
    {
        // Minimale projectie voor lightweight statuspolling.
        var product = await _db.Product
            .Where(p => p.ArtikelId == id)
            .Select(p => new ProductStatusResponse
            {
                id = p.ArtikelId,
                status = p.Status
            })
            .SingleOrDefaultAsync();

        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        return Ok(product);
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Aanvoerder, Koper, Admin, Veilingmeester")]
    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAvailableProducts()
    {
        // Alleen voorraad > 0 en status BESCHIKBAAR, gesorteerd op ArtikelId.
        var producten = await _db.Product
            .Where(p =>
                p.Hoeveelheid.HasValue &&
                p.Hoeveelheid > 0 &&
                p.Status == "BESCHIKBAAR")
            .OrderBy(p => p.ArtikelId)
            .ToListAsync();

        var responses = producten.Select(p => new ProductResponse
        {
            id = p.ArtikelId,
            soort = p.Soort,
            potmaat = p.Potmaat,
            steellengte = p.Steellengte,
            hoeveelheid = p.Hoeveelheid,
            minimumprijs = p.MinimumPrijs,
            kloklokatie = p.KlokLocatie,
            afbeelding = p.Afbeelding,
            gebruiker_id = p.Gebruiker_id,
            startprijs = p.StartPrijs,
            incrementPerSecond = p.IncrementPerSecond,
            startedAtUtc = p.StartedAtUtc.HasValue ? p.StartedAtUtc.Value.ToString("o") : null,
            koopprijs = p.KoopPrijs,
            veilingId = p.VeilingId,
            koperId = p.gebruiker_id,
            status = p.Status
        }).ToList();

        return Ok(responses);
    }


    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Aanvoerder")]
    [HttpPost]
    public async Task<ActionResult<ProductResponse>> AddProduct([FromBody] CreateProductRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.soort))
            return BadRequest("Ongeldige productgegevens.");

        // Validate minimumprijs is not negative
        if (request.minimumprijs.HasValue && request.minimumprijs < 0)
            return BadRequest("MinimumPrijs kan niet negatief zijn.");

        var aanvoerderId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(aanvoerderId))
            return Unauthorized();

        var product = new Product
        {
            Gebruiker_id = aanvoerderId,
            Soort = request.soort,
            Potmaat = request.potmaat,
            Steellengte = request.steellengte,
            Hoeveelheid = request.hoeveelheid,
            MinimumPrijs = request.minimumprijs,
            KlokLocatie = request.kloklokatie,
            Afbeelding = request.afbeelding,
            Status = "BESCHIKBAAR"
        };

        if (request.startprijs.HasValue)
            product.StartPrijs = request.startprijs.Value;

        if (request.incrementPerSecond.HasValue)
            product.IncrementPerSecond = request.incrementPerSecond.Value;

        _db.Product.Add(product);
        await _db.SaveChangesAsync();

        // Return the created product data
        var response = new ProductResponse
        {
            id = product.ArtikelId,
            soort = product.Soort,
            potmaat = product.Potmaat,
            steellengte = product.Steellengte,
            hoeveelheid = product.Hoeveelheid,
            minimumprijs = product.MinimumPrijs,
            kloklokatie = product.KlokLocatie,
            afbeelding = product.Afbeelding,
            gebruiker_id = product.Gebruiker_id,
            status = product.Status,
            koperId = product.gebruiker_id
        };

        return Ok(response);
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Aanvoerder, Koper, Veilingmeester")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateProduct(int id, [FromBody] CreateProductRequest request)
    {
        // Zoek product dat geüpdatet moet worden.
        var product = await _db.Product
            .Where(p => p.ArtikelId == id)
            .SingleOrDefaultAsync();

        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        if (request == null)
            return BadRequest("Lege request body.");

        // Validate minimumprijs is not negative
        if (request.minimumprijs.HasValue && request.minimumprijs < 0)
            return BadRequest("MinimumPrijs kan niet negatief zijn.");

        var aanvoerderId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(aanvoerderId))
            return Unauthorized();

        product.Gebruiker_id = aanvoerderId;

        if (!string.IsNullOrEmpty(request.soort))
            product.Soort = request.soort;

        if (request.potmaat.HasValue)
            product.Potmaat = request.potmaat;

        if (request.steellengte.HasValue)
            product.Steellengte = request.steellengte;

        if (request.hoeveelheid.HasValue)
            product.Hoeveelheid = request.hoeveelheid;

        if (request.minimumprijs.HasValue)
            product.MinimumPrijs = request.minimumprijs;

        if (request.startprijs.HasValue)
            product.StartPrijs = request.startprijs;

        if (request.incrementPerSecond.HasValue)
            product.IncrementPerSecond = request.incrementPerSecond;

        if (!string.IsNullOrEmpty(request.kloklokatie))
            product.KlokLocatie = request.kloklokatie;

        if (!string.IsNullOrEmpty(request.afbeelding))
            product.Afbeelding = request.afbeelding;

        await _db.SaveChangesAsync();

        return Ok();
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Koper")]
    [HttpPut("{id}/assign-koper")]
    public async Task<ActionResult> AssignKoperToProduct(int id, [FromBody] UpdateProductKoper request)
    {
        // Directe koopkoppeling (buiten veiling) door Admin/Koper.
        var product = await _db.Product.Where(p => p.ArtikelId == id).SingleOrDefaultAsync();
        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        if (request == null || string.IsNullOrEmpty(request.koperId))
            return BadRequest("Ongeldig koper ID.");

        var koper = await _db.Koper.FindAsync(request.koperId);
        if (koper == null)
            return BadRequest($"Koper met ID {request.koperId} niet gevonden.");

        // Set koper id (property name in model is 'gebruiker_id' for koper)
        product.gebruiker_id = request.koperId;
        product.Status = "GEKOCHT";

        await _db.SaveChangesAsync();
        return Ok();
    }

    /// <summary>
    /// Wijs product toe aan veiling: stelt VeilingId, prijsvelden en reset runtime-status.
    /// Voorkomt dubbele toewijzing; reset oud runtime-state bij hergebruik.
    /// </summary>
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Veilingmeester")]
    [HttpPut("{id}/assign-veiling")]
    public async Task<ActionResult> AssignVeilingToProduct(int id, [FromBody] UpdateProductVeiling request)
    {
        // Haal doelproduct op (exclusief tracking voor performance niet nodig hier).
        var product = await _db.Product.Where(p => p.ArtikelId == id).SingleOrDefaultAsync();
        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        if (request == null)
            return BadRequest("Ongeldige request body.");

        if (request.veilingId.HasValue)
        {
            // **Voorkoming dubbele toewijzing**: Kan niet opnieuw toewijzen als al aan veiling gekoppeld.
            if (product.VeilingId != null)
                return BadRequest("Product is al toegewezen aan een veiling.");

            // Prevent assigning if hoeveelheid is 0 or null
            if (!product.Hoeveelheid.HasValue || product.Hoeveelheid.Value == 0)
                return BadRequest("Dit product kan niet worden toegevoegd aan een veiling");

            var veiling = await _db.Veiling.FindAsync(request.veilingId.Value);
            if (veiling == null)
                return BadRequest($"Veiling met ID {request.veilingId.Value} niet gevonden.");

            // Zet veilingkoppeling en veiling-specifieke prijsvelden.
            product.VeilingId = request.veilingId.Value;

            if (request.startprijs.HasValue)
                product.StartPrijs = request.startprijs.Value;

            if (request.incrementPerSecond.HasValue)
                product.IncrementPerSecond = request.incrementPerSecond.Value;

            // **Runtime-status reset**: Product nog niet gestart in veiling; wis alle runtime-velden.
            // Dit is cruciaal voor hergebruik: als product eerder gebruikt werd,
            // zet StartedAtUtc=null zodat ProductSequencing het als "nieuw" ziet.
            product.StartedAtUtc = null;
            product.KoopPrijs = null;
            product.gebruiker_id = null;
            product.Status = "BESCHIKBAAR";
        }
        else
        {
            // **Koppeling verwijderen**: Zet VeilingId en veiling-velden op null.
            product.VeilingId = null;
            product.StartPrijs = null;
            product.IncrementPerSecond = null;

            // Reset runtime-state; bewaar reeds verkochte producten (GEKOCHT).
            product.StartedAtUtc = null;
            product.KoopPrijs = null;
            if (product.Status != "GEKOCHT")
                product.Status = "BESCHIKBAAR";
            product.gebruiker_id = null;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Aanvoerder")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        // Hard delete: geen soft-delete kolom aanwezig.
        var product = await _db.Product
            .Where(p => p.ArtikelId == id)
            .SingleOrDefaultAsync();

        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        _db.Product.Remove(product);
        await _db.SaveChangesAsync();

        return Ok();
    }

    /// <summary>
    /// Koop product: delegeert aan AuctionManager voor concurrency-beheer, prijsberekening,
    /// GekochtProduct-creatie, en volgende-product-triggering.
    /// Valideert dat gebruiker geregistreerd is als Koper.
    /// </summary>
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Koper, Admin")]
    [HttpPost("{id}/buy")]
    public async Task<ActionResult> BuyProduct(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("Gebruiker niet herkend.");

        // **Validatie**: Controleer of gebruiker in Koper tabel bestaat (FK constraint).
        // Alleen geregistreerde kopers mogen bieden.
        var koper = await _db.Koper.FindAsync(userId);
        if (koper == null)
            return BadRequest("Uw account is niet geregistreerd als koper. Alleen kopers kunnen bieden.");

        // **Delegation**: AuctionManager handelt concurrency (semaphore), prijs,
        // GekochtProduct-creatie, hoeveelheid-decrement en SignalR-broadcasts af.
        var success = await _auctionManager.TryBuyProductAsync(id, userId);
        if (success)
            return Ok(new { message = "Product succesvol gekocht!" });

        // Conflict als product al verkocht, veiling gesloten, onvoldoende hoeveelheid, etc.
        return Conflict(new
            { message = "Kon product niet kopen. Het is mogelijk al verkocht of de veiling is gesloten." });
    }
}