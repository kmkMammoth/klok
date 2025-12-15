using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using veilingklok.Models;

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
    public string? gebruikerId { get; set; }

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
}

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly VeilingContext _db;

    public ProductsController(VeilingContext db)
    {
        _db = db;
    }

    // [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Aanvoerder, Koper")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProducts()
    {
        var producten = await _db.Product
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
            incrementPerSecond = p.IncrementPerSecond
        }).ToList();

        return Ok(responses);
    }

    //[Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Aanvoerder")]
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
            incrementPerSecond = product.IncrementPerSecond
        };

        return Ok(response);
    }

    //[Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin, Koper, Aanvoerder")]
    [HttpPost]
    public async Task<ActionResult<ProductResponse>> AddProduct([FromBody] CreateProductRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.soort) || string.IsNullOrEmpty(request.gebruikerId))
            return BadRequest("Ongeldige productgegevens.");

        // Validate minimumprijs is not negative
        if (request.minimumprijs.HasValue && request.minimumprijs < 0)
            return BadRequest("MinimumPrijs kan niet negatief zijn.");

        // Check if Aanvoerder exists (not just any Gebruiker)
        var aanvoerder = await _db.Aanvoerder.FindAsync(request.gebruikerId);

        if (aanvoerder == null)
            return BadRequest($"Aanvoerder met ID {request.gebruikerId} niet gevonden. Zorg ervoor dat je een geldig Aanvoerder ID invoert.");

        var product = new Product
        {
            Gebruiker_id = request.gebruikerId,
            Soort = request.soort,
            Potmaat = request.potmaat,
            Steellengte = request.steellengte,
            Hoeveelheid = request.hoeveelheid,
            MinimumPrijs = request.minimumprijs,
            KlokLocatie = request.kloklokatie,
            Afbeelding = request.afbeelding
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
            gebruiker_id = product.Gebruiker_id
        };

        return Ok(response);
    }

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

        // Check if new Aanvoerder exists (not just any Gebruiker)
        if (!string.IsNullOrEmpty(request.gebruikerId))
        {
            var aanvoerder = await _db.Aanvoerder.FindAsync(request.gebruikerId);

            if (aanvoerder == null)
                return BadRequest($"Aanvoerder met ID {request.gebruikerId} niet gevonden. Zorg ervoor dat je een geldig Aanvoerder ID invoert.");

            product.Gebruiker_id = request.gebruikerId;
        }

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

    // Assign a koper (Identity user id) to a product
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

        await _db.SaveChangesAsync();
        return Ok();
    }

    // Assign a veiling to a product (or clear by sending null)
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
            var veiling = await _db.Veiling.FindAsync(request.veilingId.Value);
            if (veiling == null)
                return BadRequest($"Veiling met ID {request.veilingId.Value} niet gevonden.");

            product.VeilingId = request.veilingId.Value;

            if (request.startprijs.HasValue)
                product.StartPrijs = request.startprijs.Value;

            if (request.incrementPerSecond.HasValue)
                product.IncrementPerSecond = request.incrementPerSecond.Value;
        }
        else
        {
            product.VeilingId = null;
            // clear auction-specific settings when removing from veiling
            product.StartPrijs = null;
            product.IncrementPerSecond = null;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

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
}
