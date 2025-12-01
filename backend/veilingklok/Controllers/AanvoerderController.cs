using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class AanvoerderController : ControllerBase
{
    private readonly VeilingContext _db;

    public AanvoerderController(VeilingContext db)
    {
        _db = db;
    }

    // GET: api/Aanvoerder?id={aanvoerderId}
    [HttpGet]
    public async Task<ActionResult<Aanvoerder>> GetUser(int id)
    {
        var aanvoerder = await _db.Aanvoerders
            .FirstOrDefaultAsync(a => a.GebruikerId == id);
        
        if (aanvoerder == null)
        {
            return NotFound(new { message = "Aanvoerder niet gevonden" });
        }
        
        return Ok(aanvoerder);
    }
}

