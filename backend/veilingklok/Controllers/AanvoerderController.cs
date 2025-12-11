using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using veilingklok.Models;

namespace veilingklok;

public class AanvoerderRegistratie
{
    public string UserName { get; set; }
    public string Password { get; set; }
    public string KvkNummer { get; set; }
    public string Adres { get; set; }
    public string Email { get; set; }
    public string IbanHash { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class AanvoerderController : ControllerBase
{
    private readonly VeilingContext _db;
    private readonly UserManager<Gebruiker> _userManager;
    public AanvoerderController(VeilingContext db, UserManager<Gebruiker> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(AanvoerderRegistratie dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UserName) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Gebruikersnaam en wachtwoord zijn verplicht." });
        }

        var aanvoerder = new Aanvoerder
        {
            UserName = dto.UserName,
            Naam = "Aanvoerder",
            EmailConfirmed = true,
            KvkNummer = dto.KvkNummer,
            Adres = dto.Adres,
            Email = dto.Email,
            IbanHash = dto.IbanHash
        };

        var createResult = await _userManager.CreateAsync(aanvoerder, dto.Password);

        if (!createResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Aanmaken van account mislukt.",
                errors = createResult.Errors.Select(e => e.Description)
            });
        }

        var roleResult = await _userManager.AddToRoleAsync(aanvoerder, "Aanvoerder");

        if (!roleResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Account aangemaakt maar toevoegen aan rol mislukt.",
                errors = roleResult.Errors.Select(e => e.Description)
            });
        }

        return Ok(new { message = "Aanvoerder succesvol geregistreerd." });
    }
}
