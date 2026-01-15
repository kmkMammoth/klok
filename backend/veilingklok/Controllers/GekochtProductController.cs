using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;

namespace veilingklok;

public class GekochtProductCreateDto
{
    public int ProductId { get; set; }
    public int Hoeveelheid { get; set; }
    public decimal KoopPrijs { get; set; }
}

/// <summary>
/// Response DTO voor koopgeschiedenis met JOIN-info (product soort).
/// Gebruikt voor SQL-mapping en client-weergave.
/// </summary>
public class GekochtProductHistoryDto
{
    public int Id { get; set; }
    public string GebruikerId { get; set; }
    public int ProductId { get; set; }
    public string Soort { get; set; }
    public int Hoeveelheid { get; set; }
    public decimal KoopPrijs { get; set; }
    public DateTime KoopDatum { get; set; }
}

public class GekochtProductResponseDto
{
    public int Id { get; set; }
    public string GebruikerId { get; set; }
    public int ProductId { get; set; }
    public int Hoeveelheid { get; set; }
    public decimal KoopPrijs { get; set; }
    public DateTime KoopDatum { get; set; }
}


[ApiController]
[Route("api/[controller]")]
public class GekochtProductController : ControllerBase
{
    private readonly VeilingContext _db;
    private readonly veilingklok.Services.IAuctionManager _auctionManager;

    public GekochtProductController(VeilingContext db, veilingklok.Services.IAuctionManager auctionManager)
    {
        _db = db;
        _auctionManager = auctionManager;
    }

    // GET: api/GekochtProduct
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GekochtProduct>>> GetAll()
    {
        return Ok(await _db.GekochtProduct.ToListAsync());
    }

    // GET: api/GekochtProduct/{id}
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("{id}")]
    public async Task<ActionResult<GekochtProduct>> GetById(int id)
    {
        var item = await _db.GekochtProduct
            .SingleOrDefaultAsync(g => g.Id == id);

        if (item == null)
            return NotFound();

        return Ok(item);
    }

    // GET: api/GekochtProduct/product/{productId}
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<GekochtProduct>> GetByProductId(int productId)
    {
        var item = await _db.GekochtProduct
            .SingleOrDefaultAsync(g => g.ProductId == productId);

        if (item == null)
            return NotFound();

        return Ok(item);
    }

    // POST: api/GekochtProduct
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] GekochtProductCreateDto dto)
    {
        var gebruikerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (gebruikerId == null)
            return Unauthorized("Gebruiker niet gevonden.");

        // Delegate buying logic to AuctionManager which will create GekochtProduct, decrement stock and broadcast
        var success = await _auctionManager.TryBuyProductAsync(dto.ProductId, gebruikerId, dto.Hoeveelheid <= 0 ? 1 : dto.Hoeveelheid, dto.KoopPrijs);
        if (!success)
            return BadRequest("Kopen mislukt: mogelijk onvoldoende voorraad, concurrentie of veiling gesloten.");

        return Ok();
    }


    // DELETE: api/GekochtProduct/{id}
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var item = await _db.GekochtProduct
            .SingleOrDefaultAsync(g => g.Id == id);

        if (item == null)
            return NotFound();

        _db.GekochtProduct.Remove(item);
        await _db.SaveChangesAsync();

        return Ok();
    }
    
    // GET: api/GekochtProduct/history-all-sorted
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("history-all-sorted")]
    public async Task<ActionResult> GetHistoryAllSorted()
    {
        try
        {
            // We halen alles op met een JOIN, gesorteerd op soort (en daarna datum)
            // De database gebruikt een index op 'soort' voor deze sortering.
            var sql = @"
                SELECT 
                    g.Id, 
                    g.koper_id as GebruikerId,
                    g.product_id as ProductId, 
                    p.soort as Soort, 
                    g.hoeveelheid as Hoeveelheid, 
                    g.koopprijs as KoopPrijs, 
                    g.KoopDatum 
                FROM GekochtProduct g
                INNER JOIN Product p ON g.product_id = p.artikel_id
                ORDER BY g.KoopDatum DESC";

            var history = await _db.Database
                .SqlQueryRaw<GekochtProductHistoryDto>(sql)
                .ToListAsync();

            return Ok(history);
        }
        catch (Exception ex)
        {
            return BadRequest($"Fout bij ophalen historie: {ex.Message}");
        }
    }
}
