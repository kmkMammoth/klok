using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace veilingklok;

public class CreateProductRequest
{
    public string soort { get; set; }
    public int? potmaat { get; set; }
    public decimal? steellengte { get; set; }
    public int? hoeveelheid { get; set; }
    public decimal? minimumprijs { get; set; }
    public string kloklokatie { get; set; }
    public string afbeelding { get; set; }
    public int aanvoerderId { get; set; }
}

public class ProductResponse
{
    public int id { get; set; }
    public string soort { get; set; }
    public int? potmaat { get; set; }
    public decimal? steellengte { get; set; }
    public int? hoeveelheid { get; set; }
    public decimal? minimumprijs { get; set; }
    public string kloklokatie { get; set; }
    public string afbeelding { get; set; }
    public int aanvoerderId { get; set; }
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProducts()
    {
        var producten = await _db.Producten
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
            aanvoerderId = p.AanvoerderId
        }).ToList();

        return Ok(responses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> GetProduct(int id)
    {
        var product = await _db.Producten
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
            aanvoerderId = product.AanvoerderId
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponse>> AddProduct([FromBody] CreateProductRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.soort) || request.aanvoerderId <= 0)
            return BadRequest("Ongeldige productgegevens.");

        // Validate minimumprijs is not negative
        if (request.minimumprijs.HasValue && request.minimumprijs < 0)
            return BadRequest("MinimumPrijs kan niet negatief zijn.");

        // Check if Aanvoerder exists
        var aanvoerder = await _db.Aanvoerders
            .Where(a => a.AanvoerderId == request.aanvoerderId)
            .SingleOrDefaultAsync();

        if (aanvoerder == null)
            return BadRequest($"Aanvoerder met ID {request.aanvoerderId} niet gevonden.");

        var product = new Product
        {
            AanvoerderId = request.aanvoerderId,
            Soort = request.soort,
            Potmaat = request.potmaat,
            Steellengte = request.steellengte,
            Hoeveelheid = request.hoeveelheid,
            MinimumPrijs = request.minimumprijs,
            KlokLocatie = request.kloklokatie,
            Afbeelding = request.afbeelding
        };

        _db.Producten.Add(product);
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
            aanvoerderId = product.AanvoerderId
        };

        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateProduct(int id, [FromBody] CreateProductRequest request)
    {
        var product = await _db.Producten
            .Where(p => p.ArtikelId == id)
            .SingleOrDefaultAsync();

        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        if (request == null)
            return BadRequest("Lege request body.");

        // Validate minimumprijs is not negative
        if (request.minimumprijs.HasValue && request.minimumprijs < 0)
            return BadRequest("MinimumPrijs kan niet negatief zijn.");

        // Check if new Aanvoerder exists
        if (request.aanvoerderId > 0)
        {
            var aanvoerder = await _db.Aanvoerders
                .Where(a => a.AanvoerderId == request.aanvoerderId)
                .SingleOrDefaultAsync();

            if (aanvoerder == null)
                return BadRequest($"Aanvoerder met ID {request.aanvoerderId} niet gevonden.");

            product.AanvoerderId = request.aanvoerderId;
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

        if (!string.IsNullOrEmpty(request.kloklokatie))
            product.KlokLocatie = request.kloklokatie;

        if (!string.IsNullOrEmpty(request.afbeelding))
            product.Afbeelding = request.afbeelding;

        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await _db.Producten
            .Where(p => p.ArtikelId == id)
            .SingleOrDefaultAsync();

        if (product == null)
            return NotFound($"Product met ID {id} niet gevonden.");

        _db.Producten.Remove(product);
        await _db.SaveChangesAsync();

        return Ok();
    }
}
