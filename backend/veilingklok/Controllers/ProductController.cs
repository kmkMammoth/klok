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

public class UpdateProductVeiling
{
    public int? veilingId { get; set; }
    public decimal? startprijs { get; set; }
    public decimal? incrementPerSecond { get; set; }
}
public class UpdateProductKoper
{
    public string? koperId { get; set; }
}

public class ProductStatusResponse
{
    public int id { get; set; }
    public string? status { get; set; }
}

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

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Veilingmeester")]
    [HttpPut("{id}/assign-veiling")]
    public async Task<ActionResult> AssignVeilingToProduct(int id, [FromBody] UpdateProductVeiling request)
    {
        var product = await _db.Product.Where(p => p.ArtikelId == id).SingleOrDefaultAsync();
        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        // allow clearing the veiling by sending null
        if (request == null)
            return BadRequest("Ongeldige request body.");

        if (request.veilingId.HasValue)
        {
            // Prevent assigning if already assigned to a veiling
            if (product.VeilingId != null)
                return BadRequest("Product is al toegewezen aan een veiling.");

            var veiling = await _db.Veiling.FindAsync(request.veilingId.Value);
            if (veiling == null)
                return BadRequest($"Veiling met ID {request.veilingId.Value} niet gevonden.");

            product.VeilingId = request.veilingId.Value;

            if (request.startprijs.HasValue)
                product.StartPrijs = request.startprijs.Value;

            if (request.incrementPerSecond.HasValue)
                product.IncrementPerSecond = request.incrementPerSecond.Value;

            // When adding to a new veiling ensure any previous runtime auction state is cleared
            product.StartedAtUtc = null;
            product.KoopPrijs = null;
            product.gebruiker_id = null;
            product.Status = "BESCHIKBAAR";
        }
        else
        {
            product.VeilingId = null;
            // clear auction-specific settings when removing from veiling
            product.StartPrijs = null;
            product.IncrementPerSecond = null;

            // Also clear any runtime auction state so the product can be reused cleanly
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
        var product = await _db.Product
            .Where(p => p.ArtikelId == id)
            .SingleOrDefaultAsync();

        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        _db.Product.Remove(product);
        await _db.SaveChangesAsync();

        return Ok();
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Koper, Admin")]
    [HttpPost("{id}/buy")]
    public async Task<ActionResult> BuyProduct(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("Gebruiker niet herkend.");

        // Controleer of de gebruiker bestaat in de Koper tabel om FK constraint errors te voorkomen
        var koper = await _db.Koper.FindAsync(userId);
        if (koper == null)
            return BadRequest("Uw account is niet geregistreerd als koper. Alleen kopers kunnen bieden.");

        // Delegate buy operation to AuctionManager which enforces concurrency and broadcasts
        var success = await _auctionManager.TryBuyProductAsync(id, userId);
        if (success)
            return Ok(new { message = "Product succesvol gekocht!" });

        return Conflict(new
            { message = "Kon product niet kopen. Het is mogelijk al verkocht of de veiling is gesloten." });
    }
}