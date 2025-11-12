using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<ActionResult<IEnumerable<Gebruiker>>> GetUser(int id)
    {
        var koper = await _db.Kopers.Where(koper => koper.GebruikerId == id).SingleAsync();
        return Ok(koper);
    }
    
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> AddKoper(int userID, string kvkNumber, string adress, string email, string ibanHash)
    {
        _db.Add(new Koper {GebruikerId = userID, KvkNummer = kvkNumber, Adres = adress, IbanHash = ibanHash, Email = email});
        await _db.SaveChangesAsync();
        return Ok();
    }
    
    [HttpPut]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> ChangeKoper(int koperID, int userID, string kvkNumber, string adress, string email, string ibanHash)
    {
        var koper = await _db.Kopers.Where(koper => koper.GebruikerId == koperID).SingleAsync();
        koper.GebruikerId = koperID;
        koper.KvkNummer = kvkNumber;
        koper.Adres = adress;
        koper.Email = email;
        koper.IbanHash = ibanHash;
        _db.Update(koper);
        await _db.SaveChangesAsync();
        return Ok();
    }
    
    [HttpDelete]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> DeleteUser(int koperID)
    {
        var koper = await _db.Kopers.Where(koper => koper.GebruikerId == koperID).SingleAsync();
        _db.Remove(User);
        await _db.SaveChangesAsync();
        return Ok();
    }
    
}