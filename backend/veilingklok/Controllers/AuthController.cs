using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using veilingklok.DTOs;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly VeilingContext _db;

    public AuthController(VeilingContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Wachtwoord hash methode
    /// </summary>
    private static string HashPassword(string password)
    {
        using SHA256 sha256 = SHA256.Create();
        byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < bytes.Length; i++)
        {
            builder.Append(bytes[i].ToString("x2"));
        }
        return builder.ToString();
    }

    /// <summary>
    /// Login endpoint
    /// POST: api/Auth/login
    /// Ondersteunt inloggen met gebruikersnaam of e-mail
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto dto)
    {
        // Zoek gebruiker op naam
        var gebruiker = await _db.Gebruikers
            .FirstOrDefaultAsync(g => g.Naam == dto.Gebruikersnaam);

        // Als gebruiker niet gevonden, probeer via email in Kopers tabel
        if (gebruiker == null)
        {
            var koperByEmail = await _db.Kopers.FirstOrDefaultAsync(k => k.Email == dto.Gebruikersnaam);
            if (koperByEmail != null)
            {
                gebruiker = await _db.Gebruikers.FirstOrDefaultAsync(g => g.GebruikerId == koperByEmail.GebruikerId);
            }
        }

        // Als gebruiker nog steeds niet gevonden, probeer via email in Aanvoerders tabel
        if (gebruiker == null)
        {
            var aanvoerderByEmail = await _db.Aanvoerders.FirstOrDefaultAsync(a => a.Email == dto.Gebruikersnaam);
            if (aanvoerderByEmail != null)
            {
                gebruiker = await _db.Gebruikers.FirstOrDefaultAsync(g => g.GebruikerId == aanvoerderByEmail.GebruikerId);
            }
        }

        if (gebruiker == null)
        {
            return BadRequest(new LoginResponseDto 
            { 
                Success = false, 
                Message = "Gebruikersnaam of wachtwoord is onjuist" 
            });
        }

        // Controleer wachtwoord
        var hashedPassword = HashPassword(dto.Wachtwoord);
        if (gebruiker.WachtwoordHash != hashedPassword)
        {
            return BadRequest(new LoginResponseDto 
            { 
                Success = false, 
                Message = "Gebruikersnaam of wachtwoord is onjuist" 
            });
        }

        // Bepaal account type
        string accountType = "";
        int? roleId = null;

        // Controleer of gebruiker een Veilingmeester is
        var veilingmeester = await _db.Veilingmeesters
            .FirstOrDefaultAsync(v => v.GebruikerId == gebruiker.GebruikerId);
        if (veilingmeester != null)
        {
            accountType = "veilingmeester";
            roleId = veilingmeester.VeilingmeesterId;
        }

        // Controleer of gebruiker een Koper is
        var koper = await _db.Kopers
            .FirstOrDefaultAsync(k => k.GebruikerId == gebruiker.GebruikerId);
        if (koper != null)
        {
            accountType = "koper";
            roleId = koper.KoperId;
        }

        // Controleer of gebruiker een Aanvoerder is
        var aanvoerder = await _db.Aanvoerders
            .FirstOrDefaultAsync(a => a.GebruikerId == gebruiker.GebruikerId);
        if (aanvoerder != null)
        {
            accountType = "aanvoerder";
            roleId = aanvoerder.AanvoerderId;
        }

        if (string.IsNullOrEmpty(accountType))
        {
            return BadRequest(new LoginResponseDto 
            { 
                Success = false, 
                Message = "Account heeft geen geldige rol" 
            });
        }

        return Ok(new LoginResponseDto
        {
            Success = true,
            Message = "Inloggen succesvol",
            GebruikerId = gebruiker.GebruikerId,
            Gebruikersnaam = gebruiker.Naam,
            AccountType = accountType,
            RoleId = roleId
        });
    }
}

