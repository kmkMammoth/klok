using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    private readonly VeilingContext _db;

    public LoginController(VeilingContext db)
    {
        _db = db;
    }

    // GET: api/login
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> GetAll()
    {
        var users = await _db.Gebruikers.ToListAsync();
        return Ok(users);
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> CreateUser()
    {
        var users = await _db.Gebruikers.ToListAsync();
        return Ok(users);
    }
}