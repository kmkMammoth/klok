using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;

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
    public async Task<ActionResult<IEnumerable<Gebruiker>>> GetUser(string id)
    {
        var users = await _db.Gebruiker.Where(gebruiker => gebruiker.Id == id).ToListAsync();
        Console.WriteLine(users.Count);
        return Ok(users);
    }
    
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> AddUser(string name)
    {
        _db.Add(new Gebruiker {Naam = name});
        await _db.SaveChangesAsync();
        return Ok();
    }
    
    [HttpPut]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> ChangeUser(string id, string name)
    {
        var User = await _db.Gebruiker.Where(gebruiker => gebruiker.Id == id).SingleAsync();
        User.Naam = name;
        await _db.SaveChangesAsync();
        return Ok();
    }
    
    [HttpDelete]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> DeleteUser(string id)
    {
        var User = await _db.Gebruiker.Where(gebruiker => gebruiker.Id == id).SingleAsync();
        _db.Remove(User);
        await _db.SaveChangesAsync();
        return Ok();
    }
    
}