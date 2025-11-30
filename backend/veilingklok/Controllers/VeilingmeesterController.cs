using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class VeilingmeesterController : ControllerBase
{
    private readonly VeilingContext _db;

    public VeilingmeesterController(VeilingContext db)
    {
        _db = db;
    }

    // GET: api/Veilingmeester?id={veilingmeesterId}
    [HttpGet]
    public async Task<ActionResult<Veilingmeester>> GetUser(int id)
    {
        var veilingmeester = await _db.Veilingmeesters
            .Include(v => v.Gebruiker)
            .FirstOrDefaultAsync(v => v.VeilingmeesterId == id);
        
        if (veilingmeester == null)
        {
            return NotFound(new { message = "Veilingmeester niet gevonden" });
        }
        
        return Ok(veilingmeester);
    }
}

