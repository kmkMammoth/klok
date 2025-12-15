using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;

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

    public AuctionsController(VeilingContext db)
    {
        _db = db;
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Aanvoerder, Koper, Admin, Veilingmeester")]
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
        }).ToList();

        return Ok(responses);
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Aanvoerder, Koper, Admin, Veilingmeester")]
    [HttpGet("{id}")]
    public async Task<ActionResult<AuctionResponse>> GetAuction(int id)
    {
        var veiling = await _db.Veiling
            .Where(v => v.VeilingId == id)
            .SingleOrDefaultAsync();

        if (veiling == null)
            return NotFound($"Veiling met ID {id} niet gevonden.");

        var response = new AuctionResponse
        {
            id = veiling.VeilingId,
            name = veiling.VeilingNaam,
            maxTime = (int)(veiling.EindTijd - veiling.StartTijd).TotalSeconds,
            startingPrice = veiling.MinimumPrijs ?? 0,
            status = veiling.Status,
            startTime = new DateTimeOffset(veiling.StartTijd).ToUnixTimeMilliseconds(),
            endTime = new DateTimeOffset(veiling.EindTijd).ToUnixTimeMilliseconds()
        };

        return Ok(response);
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Veilingmeester, Admin")]
    [HttpPost]
    public async Task<ActionResult<AuctionResponse>> AddAuction([FromBody] CreateAuctionRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.name) || request.maxTime <= 0 || request.startingPrice < 0)
            return BadRequest("Ongeldige veilinggegevens.");

        var veiling = new Veiling
        {
            VeilingNaam = request.name,
            MinimumPrijs = request.startingPrice,
            Status = "Idle",
            StartTijd = DateTime.Now,
            EindTijd = DateTime.Now.AddSeconds(request.maxTime),
            Gebruiker_id = "1", // tijdelijke placeholder — later koppelen aan echte user
        };

        _db.Veiling.Add(veiling);
        await _db.SaveChangesAsync();

        // Return de gegevens in het frontend-format
        var response = new AuctionResponse
        {
            id = veiling.VeilingId,
            name = veiling.VeilingNaam,
            maxTime = (int)(veiling.EindTijd - veiling.StartTijd).TotalSeconds,
            startingPrice = veiling.MinimumPrijs ?? 0,
            status = veiling.Status,
            startTime = new DateTimeOffset(veiling.StartTijd).ToUnixTimeMilliseconds(),
            endTime = new DateTimeOffset(veiling.EindTijd).ToUnixTimeMilliseconds()
        };

        return Ok(response);
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Veilingmeester, Admin, Koper")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateAuction(int id, string status)
    {
        var veiling = await _db.Veiling
            .Where(v => v.VeilingId == id)
            .SingleOrDefaultAsync();

        if (veiling == null)
            return NotFound($"Veiling met ID {id} niet gevonden.");

        veiling.Status = status;
        await _db.SaveChangesAsync();

        return Ok();
    }

    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Veilingmeester, Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAuction(int id)
    {
        var veiling = await _db.Veiling
            .Where(v => v.VeilingId == id)
            .SingleOrDefaultAsync();

        if (veiling == null)
            return NotFound($"Veiling met ID {id} niet gevonden.");

        _db.Veiling.Remove(veiling);
        await _db.SaveChangesAsync();

        return Ok();
    }
}