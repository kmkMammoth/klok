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
        // Zoek in alle subklassen (Aanvoerder, Koper, Veilingmeester) omdat ze nu Gebruiker erven
        string accountType = "";
        int? roleId = null;
        Gebruiker gebruiker = null;

        // Controleer eerst op naam in alle tabellen
        var koperByNaam = await _db.Kopers.FirstOrDefaultAsync(k => k.Naam == dto.Gebruikersnaam);
        if (koperByNaam != null)
        {
            gebruiker = koperByNaam;
            accountType = "koper";
            roleId = koperByNaam.GebruikerId;
        }

        if (gebruiker == null)
        {
            var aanvoerderByNaam = await _db.Aanvoerders.FirstOrDefaultAsync(a => a.Naam == dto.Gebruikersnaam);
            if (aanvoerderByNaam != null)
            {
                gebruiker = aanvoerderByNaam;
                accountType = "aanvoerder";
                roleId = aanvoerderByNaam.GebruikerId;
            }
        }

        if (gebruiker == null)
        {
            var veilingmeesterByNaam = await _db.Veilingmeesters.FirstOrDefaultAsync(v => v.Naam == dto.Gebruikersnaam);
            if (veilingmeesterByNaam != null)
            {
                gebruiker = veilingmeesterByNaam;
                accountType = "veilingmeester";
                roleId = veilingmeesterByNaam.GebruikerId;
            }
        }

        // Als niet gevonden via naam, probeer via email in Kopers of Aanvoerders
        if (gebruiker == null)
        {
            var koperByEmail = await _db.Kopers.FirstOrDefaultAsync(k => k.Email == dto.Gebruikersnaam);
            if (koperByEmail != null)
            {
                gebruiker = koperByEmail;
                accountType = "koper";
                roleId = koperByEmail.GebruikerId;
            }
        }

        if (gebruiker == null)
        {
            var aanvoerderByEmail = await _db.Aanvoerders.FirstOrDefaultAsync(a => a.Email == dto.Gebruikersnaam);
            if (aanvoerderByEmail != null)
            {
                gebruiker = aanvoerderByEmail;
                accountType = "aanvoerder";
                roleId = aanvoerderByEmail.GebruikerId;
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

