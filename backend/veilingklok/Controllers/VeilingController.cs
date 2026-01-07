using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;
using veilingklok.Services;

namespace veilingklok;

// ✅ DTO for creating auctions
public class CreateAuctionRequest
{
    public string name { get; set; }
    public int maxTime { get; set; }
    public decimal startingPrice { get; set; }
}

// ✅ DTO for auction response
public class AuctionResponse
{
    public int id { get; set; }
    public string name { get; set; }
    public int maxTime { get; set; }
    public decimal startingPrice { get; set; }
    public string status { get; set; }
    public long startTime { get; set; }
    public long endTime { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class AuctionsController : ControllerBase
{
    private readonly VeilingContext _db;
    private readonly IAuctionManager _auctionManager;

    public AuctionsController(VeilingContext db, IAuctionManager auctionManager)
    {
        _db = db;
        _auctionManager = auctionManager;
    }

    // GET: api/Auctions
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuctionResponse>>> GetAllAuctions()
    {
        var veilingen = await _db.Veiling
            .OrderBy(v => v.VeilingId)
            .ToListAsync();

        var responses = veilingen.Select(v => new AuctionResponse
        {
            id = v.VeilingId,
            name = v.VeilingNaam,
            maxTime = (int)(v.EindTijd - v.StartTijd).TotalSeconds,
            startingPrice = v.MinimumPrijs ?? 0,
            status = v.Status,
            startTime = new DateTimeOffset(v.StartTijd).ToUnixTimeMilliseconds(),
            endTime = new DateTimeOffset(v.EindTijd).ToUnixTimeMilliseconds()
        });

        return Ok(responses);
    }

    // GET: api/Auctions/{id}
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("{id}")]
    public async Task<ActionResult<AuctionResponse>> GetAuction(int id)
    {
        var veiling = await _db.Veiling.SingleOrDefaultAsync(v => v.VeilingId == id);
        if (veiling == null) return NotFound();

        return Ok(new AuctionResponse
        {
            id = veiling.VeilingId,
            name = veiling.VeilingNaam,
            maxTime = (int)(veiling.EindTijd - veiling.StartTijd).TotalSeconds,
            startingPrice = veiling.MinimumPrijs ?? 0,
            status = veiling.Status,
            startTime = new DateTimeOffset(veiling.StartTijd).ToUnixTimeMilliseconds(),
            endTime = new DateTimeOffset(veiling.EindTijd).ToUnixTimeMilliseconds()
        });
    }

    // POST: api/Auctions
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Veilingmeester, Admin")]
    [HttpPost]
    public async Task<ActionResult<AuctionResponse>> AddAuction([FromBody] CreateAuctionRequest request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.name) ||
            request.maxTime <= 0 ||
            request.startingPrice < 0)
        {
            return BadRequest("Ongeldige veilinggegevens.");
        }

        var veilingmeesterId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(veilingmeesterId))
            return Unauthorized();

        var now = DateTime.UtcNow;
        var veiling = new Veiling
        {
            VeilingNaam = request.name,
            MinimumPrijs = request.startingPrice,
            Status = "Idle",
            StartTijd = now,
            EindTijd = now.AddSeconds(request.maxTime),
            Gebruiker_id = veilingmeesterId
        };

        _db.Veiling.Add(veiling);
        await _db.SaveChangesAsync();

        return Ok(new AuctionResponse
        {
            id = veiling.VeilingId,
            name = veiling.VeilingNaam,
            maxTime = (int)(veiling.EindTijd - veiling.StartTijd).TotalSeconds,
            startingPrice = veiling.MinimumPrijs ?? 0,
            status = veiling.Status,
            startTime = new DateTimeOffset(veiling.StartTijd).ToUnixTimeMilliseconds(),
            endTime = new DateTimeOffset(veiling.EindTijd).ToUnixTimeMilliseconds()
        });
    }

    // PUT: api/Auctions/{id}
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Veilingmeester,Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateAuction(int id, string status)
    {
        var veiling = await _db.Veiling.SingleOrDefaultAsync(v => v.VeilingId == id);
        if (veiling == null) return NotFound();

        // If we're starting the auction, let auction manager handle start and broadcasting
        if (!string.IsNullOrWhiteSpace(status) && status == "Ongoing")
        {
            await _auctionManager.StartAuctionAsync(id);
            return Ok();
        }

        veiling.Status = status;
        await _db.SaveChangesAsync();
        return Ok();
    }

    // DELETE: api/Auctions/{id}
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Veilingmeester,Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAuction(int id)
    {
        var veiling = await _db.Veiling.SingleOrDefaultAsync(v => v.VeilingId == id);
        if (veiling == null) return NotFound();

        var producten = await _db.Product.Where(p => p.VeilingId == id).ToListAsync();
        foreach (var p in producten)
        {
            p.VeilingId = null;
            p.StartPrijs = null;
            p.IncrementPerSecond = null;

            // Reset runtime auction fields for products that were not sold
            if (p.Status != "GEKOCHT")
            {
                p.StartedAtUtc = null;
                p.KoopPrijs = null;
                p.gebruiker_id = null;
                p.Status = "BESCHIKBAAR";
            }
        }

        await _db.SaveChangesAsync();
        _db.Veiling.Remove(veiling);
        await _db.SaveChangesAsync();

        return Ok();
    }
}