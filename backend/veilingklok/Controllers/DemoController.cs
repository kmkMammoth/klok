using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class DemoController : ControllerBase
{
    private readonly VeilingContext _db;

    public DemoController(VeilingContext db)
    {
        _db = db;
    }

    // POST: api/demo/create
    [HttpPost("create")]
    public async Task<IActionResult> CreateDemoAccounts()
    {
        try
        {
            // Hash password function
            string HashPassword(string password)
            {
                using (var sha256 = SHA256.Create())
                {
                    var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                    return Convert.ToBase64String(hashedBytes);
                }
            }

            var createdAccounts = new List<string>();

            // Create Demo Veilingmeester
            if (!await _db.Gebruikers.AnyAsync(g => g.Naam == "demo_veilingmeester"))
            {
                var veilingmeesterUser = new Gebruiker
                {
                    Naam = "demo_veilingmeester",
                    WachtwoordHash = HashPassword("demo123")
                };
                _db.Gebruikers.Add(veilingmeesterUser);
                await _db.SaveChangesAsync();

            var veilingmeester = new Veilingmeester
            {
                VeilingmeesterId = veilingmeesterUser.GebruikerId
            };
                _db.Veilingmeesters.Add(veilingmeester);
                await _db.SaveChangesAsync();
                createdAccounts.Add("Veilingmeester: demo_veilingmeester / demo123");
            }

            // Create Demo Koper
            if (!await _db.Gebruikers.AnyAsync(g => g.Naam == "demo_koper"))
            {
                var koperUser = new Gebruiker
                {
                    Naam = "demo_koper",
                    WachtwoordHash = HashPassword("demo123")
                };
                _db.Gebruikers.Add(koperUser);
                await _db.SaveChangesAsync();

                var koper = new Koper
                {
                    GebruikerId = koperUser.GebruikerId,
                    KvkNummer = "12345678",
                    Adres = "Demo Straat 123, Amsterdam",
                    Email = "demo_koper@example.com",
                    IbanHash = HashPassword("NL91ABNA0417164300")
                };
                _db.Kopers.Add(koper);
                await _db.SaveChangesAsync();
                createdAccounts.Add("Koper: demo_koper / demo123");
            }

            // Create Demo Aanvoerder
            if (!await _db.Gebruikers.AnyAsync(g => g.Naam == "demo_aanvoerder"))
            {
                var aanvoerderUser = new Gebruiker
                {
                    Naam = "demo_aanvoerder",
                    WachtwoordHash = HashPassword("demo123")
                };
                _db.Gebruikers.Add(aanvoerderUser);
                await _db.SaveChangesAsync();

                var aanvoerder = new Aanvoerder
                {
                    GebruikerId = aanvoerderUser.GebruikerId,
                    KvkNummer = "87654321",
                    Adres = "Demo Weg 456, Rotterdam",
                    Email = "demo_aanvoerder@example.com",
                    IbanHash = HashPassword("NL91ABNA0417164301")
                };
                _db.Aanvoerders.Add(aanvoerder);
                await _db.SaveChangesAsync();
                createdAccounts.Add("Aanvoerder: demo_aanvoerder / demo123");
            }

            if (createdAccounts.Count == 0)
            {
                return Ok(new { message = "Demo accounts already exist", accounts = new[] {
                    "Veilingmeester: demo_veilingmeester / demo123",
                    "Koper: demo_koper / demo123",
                    "Aanvoerder: demo_aanvoerder / demo123"
                }});
            }

            return Ok(new { 
                message = "Demo accounts created successfully", 
                accounts = createdAccounts 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating demo accounts", error = ex.Message });
        }
    }

    // GET: api/demo/list
    [HttpGet("list")]
    public async Task<IActionResult> ListDemoAccounts()
    {
        var accounts = new List<object>();

        var veilingmeester = await _db.Gebruikers
            .Where(g => g.Naam == "demo_veilingmeester")
            .FirstOrDefaultAsync();
        if (veilingmeester != null)
        {
            accounts.Add(new { type = "Veilingmeester", username = "demo_veilingmeester", password = "demo123" });
        }

        var koper = await _db.Gebruikers
            .Where(g => g.Naam == "demo_koper")
            .FirstOrDefaultAsync();
        if (koper != null)
        {
            accounts.Add(new { type = "Koper", username = "demo_koper", password = "demo123" });
        }

        var aanvoerder = await _db.Gebruikers
            .Where(g => g.Naam == "demo_aanvoerder")
            .FirstOrDefaultAsync();
        if (aanvoerder != null)
        {
            accounts.Add(new { type = "Aanvoerder", username = "demo_aanvoerder", password = "demo123" });
        }

        return Ok(new { accounts });
    }
}

