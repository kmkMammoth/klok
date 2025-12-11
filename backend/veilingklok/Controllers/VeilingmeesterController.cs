using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using veilingklok.Models;

namespace veilingklok;

public class VeilingmeesterRegistratie
{
    public string UserName { get; set; }
    public string Password { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class VeilingmeesterController : ControllerBase
{
    private readonly VeilingContext _db;
    private readonly UserManager<Gebruiker> _userManager;
    public VeilingmeesterController(VeilingContext db, UserManager<Gebruiker> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpPost("register")]
        public async Task<IActionResult> Register(VeilingmeesterRegistratie dto)
        {
            if (string.IsNullOrWhiteSpace(dto.UserName) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "Gebruikersnaam en wachtwoord zijn verplicht." });
            }

            var veilingmeester = new Veilingmeester
            {
                UserName = dto.UserName,
                Naam = "Veilingmeester",
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(veilingmeester, dto.Password);

            if (!createResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Aanmaken van account mislukt.",
                    errors = createResult.Errors.Select(e => e.Description)
                });
            }

            var roleResult = await _userManager.AddToRoleAsync(veilingmeester, "Veilingmeester");

            if (!roleResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Account aangemaakt maar toevoegen aan rol mislukt.",
                    errors = roleResult.Errors.Select(e => e.Description)
                });
            }

            return Ok(new { message = "Veilingmeester succesvol geregistreerd." });
        }

}
