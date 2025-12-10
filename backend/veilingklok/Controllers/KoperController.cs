using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class KoperController : ControllerBase
{
    private readonly VeilingContext _db;

    public KoperController(VeilingContext db)
    {
        _db = db;
    }

    // GET: api/login
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> GetUser(string id)
    {
        var koper = await _db.Koper.Where(koper => koper.Id == id).SingleAsync();
        return Ok(koper);
    }
    
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> AddKoper(string userID, string kvkNumber, string adress, string email, string ibanHash)
    {
        _db.Add(new Koper {Id = userID, KvkNummer = kvkNumber, Adres = adress, IbanHash = ibanHash, Email = email});
        await _db.SaveChangesAsync();
        return Ok();
    }
    
    [HttpPut]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> ChangeKoper(string koperID, string userID, string kvkNumber, string adress, string email, string ibanHash)
    {
        var koper = await _db.Koper.Where(koper => koper.Id == koperID).SingleAsync();
        koper.Id = koperID;
        koper.KvkNummer = kvkNumber;
        koper.Adres = adress;
        koper.Email = email;
        koper.IbanHash = ibanHash;
        _db.Update(koper);
        await _db.SaveChangesAsync();
        return Ok();
    }
    
    [HttpDelete]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> DeleteUser(string koperID)
    {
        var koper = await _db.Koper.Where(koper => koper.Id == koperID).SingleAsync();
        _db.Remove(User);
        await _db.SaveChangesAsync();
        return Ok();
    }
    
}