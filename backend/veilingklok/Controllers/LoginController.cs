using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class UserManagementController : ControllerBase
{
    private readonly VeilingContext _db;

    public UserManagementController(VeilingContext db)
    {
        _db = db;
    }

    // GET: api/login
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> GetUser(int id)
    {
        var users = await _db.Gebruikers.Where(gebruiker => gebruiker.GebruikerId == id).ToListAsync();
        Console.WriteLine(users.Count);
        return Ok(users);
    }
    
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> AddUser(string name, string password)
    {
        _db.Add(new Gebruiker {Naam = name, WachtwoordHash = password});
        await _db.SaveChangesAsync();
        return Ok();
    }
    
    [HttpPut]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> ChangeUser(int id, string name, string password)
    {
        var User = await _db.Gebruikers.Where(gebruiker => gebruiker.GebruikerId == id).SingleAsync();
        User.Naam = name;
        User.WachtwoordHash = password;
        await _db.SaveChangesAsync();
        return Ok();
    }
    
    [HttpDelete]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> DeleteUser(int id)
    {
        var User = await _db.Gebruikers.Where(gebruiker => gebruiker.GebruikerId == id).SingleAsync();
        _db.Remove(User);
        await _db.SaveChangesAsync();
        return Ok();
    }
    
}