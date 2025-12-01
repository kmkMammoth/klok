using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using veilingklok.DTOs;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class RegisterController : ControllerBase
{
    private readonly VeilingContext _db;

    public RegisterController(VeilingContext db)
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
    /// Registreer Koper (koper account aanmaken)
    /// POST: api/Register/koper
    /// </summary>
    [HttpPost("koper")]
    public async Task<ActionResult<RegistratieResponseDto>> RegisterKoper([FromBody] KoperRegistratieDto dto)
    {
        // Controleer of gebruikersnaam al bestaat
        var existingUser = await _db.Gebruikers.FirstOrDefaultAsync(g => g.Naam == dto.Bedrijfsnaam);
        if (existingUser != null)
        {
            return BadRequest(new ErrorResponseDto { Message = "Gebruikersnaam bestaat al" });
        }

        // Controleer of wachtwoorden overeenkomen
        if (dto.Wachtwoord != dto.BevestigWachtwoord)
        {
            return BadRequest(new ErrorResponseDto { Message = "Wachtwoorden komen niet overeen" });
        }

        try
        {
            // Maak Koper aan (erft van Gebruiker)
            var koper = new Koper
            {
                Naam = dto.Bedrijfsnaam,
                WachtwoordHash = HashPassword(dto.Wachtwoord),
                KvkNummer = dto.KvkNummer,
                Adres = dto.Bedrijfsadres,
                Email = dto.Email,
                IbanHash = HashPassword(dto.Iban)
            };
            _db.Kopers.Add(koper);
            await _db.SaveChangesAsync();

            return Ok(new RegistratieResponseDto
            {
                Message = "Koper succesvol geregistreerd",
                GebruikerId = koper.GebruikerId,
                KoperId = koper.GebruikerId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ErrorResponseDto 
            { 
                Message = "Er is een fout opgetreden", 
                Error = ex.Message 
            });
        }
    }

    /// <summary>
    /// Registreer Aanvoerder (aanvoerder account aanmaken)
    /// POST: api/Register/aanvoerder
    /// </summary>
    [HttpPost("aanvoerder")]
    public async Task<ActionResult<RegistratieResponseDto>> RegisterAanvoerder([FromBody] AanvoerderRegistratieDto dto)
    {
        // Controleer of gebruikersnaam al bestaat
        var existingUser = await _db.Gebruikers.FirstOrDefaultAsync(g => g.Naam == dto.Bedrijfsnaam);
        if (existingUser != null)
        {
            return BadRequest(new ErrorResponseDto { Message = "Gebruikersnaam bestaat al" });
        }

        // Controleer of wachtwoorden overeenkomen
        if (dto.Wachtwoord != dto.BevestigWachtwoord)
        {
            return BadRequest(new ErrorResponseDto { Message = "Wachtwoorden komen niet overeen" });
        }

        try
        {
            // Maak Aanvoerder aan (erft van Gebruiker)
            var aanvoerder = new Aanvoerder
            {
                Naam = dto.Bedrijfsnaam,
                WachtwoordHash = HashPassword(dto.Wachtwoord),
                KvkNummer = dto.KvkNummer,
                Adres = dto.Bedrijfsadres,
                Email = dto.Email,
                IbanHash = HashPassword(dto.Iban)
            };
            _db.Aanvoerders.Add(aanvoerder);
            await _db.SaveChangesAsync();

            return Ok(new RegistratieResponseDto
            {
                Message = "Aanvoerder succesvol geregistreerd",
                GebruikerId = aanvoerder.GebruikerId,
                AanvoerderId = aanvoerder.GebruikerId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ErrorResponseDto 
            { 
                Message = "Er is een fout opgetreden", 
                Error = ex.Message 
            });
        }
    }

    /// <summary>
    /// Registreer Veilingmeester (veilingmeester account aanmaken)
    /// POST: api/Register/veilingmeester
    /// </summary>
    [HttpPost("veilingmeester")]
    public async Task<ActionResult<RegistratieResponseDto>> RegisterVeilingmeester([FromBody] VeilingmeesterRegistratieDto dto)
    {
        // Controleer of gebruikersnaam al bestaat
        var existingUser = await _db.Gebruikers.FirstOrDefaultAsync(g => g.Naam == dto.Gebruikersnaam);
        if (existingUser != null)
        {
            return BadRequest(new ErrorResponseDto { Message = "Gebruikersnaam bestaat al" });
        }

        // Controleer of wachtwoorden overeenkomen
        if (dto.Wachtwoord != dto.BevestigWachtwoord)
        {
            return BadRequest(new ErrorResponseDto { Message = "Wachtwoorden komen niet overeen" });
        }

        try
        {
            // Maak Veilingmeester aan (erft van Gebruiker)
            var veilingmeester = new Veilingmeester
            {
                Naam = dto.Gebruikersnaam,
                WachtwoordHash = HashPassword(dto.Wachtwoord)
            };
            _db.Veilingmeesters.Add(veilingmeester);
            await _db.SaveChangesAsync();

            return Ok(new RegistratieResponseDto
            {
                Message = "Veilingmeester succesvol geregistreerd",
                GebruikerId = veilingmeester.GebruikerId,
                VeilingmeesterId = veilingmeester.GebruikerId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ErrorResponseDto 
            { 
                Message = "Er is een fout opgetreden", 
                Error = ex.Message 
            });
        }
    }
}
