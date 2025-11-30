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

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // Maak Gebruiker aan
            var gebruiker = new Gebruiker
            {
                Naam = dto.Bedrijfsnaam,
                WachtwoordHash = HashPassword(dto.Wachtwoord)
            };
            _db.Gebruikers.Add(gebruiker);
            await _db.SaveChangesAsync();

            // Maak Koper aan
            var koper = new Koper
            {
                GebruikerId = gebruiker.GebruikerId,
                KvkNummer = dto.KvkNummer,
                Adres = dto.Bedrijfsadres,
                Email = dto.Email,
                IbanHash = HashPassword(dto.Iban)
            };
            _db.Kopers.Add(koper);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new RegistratieResponseDto
            {
                Message = "Koper succesvol geregistreerd",
                GebruikerId = gebruiker.GebruikerId,
                KoperId = koper.KoperId
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
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

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // Maak Gebruiker aan
            var gebruiker = new Gebruiker
            {
                Naam = dto.Bedrijfsnaam,
                WachtwoordHash = HashPassword(dto.Wachtwoord)
            };
            _db.Gebruikers.Add(gebruiker);
            await _db.SaveChangesAsync();

            // Maak Aanvoerder aan
            var aanvoerder = new Aanvoerder
            {
                GebruikerId = gebruiker.GebruikerId,
                KvkNummer = dto.KvkNummer,
                Adres = dto.Bedrijfsadres,
                Email = dto.Email,
                IbanHash = HashPassword(dto.Iban)
            };
            _db.Aanvoerders.Add(aanvoerder);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new RegistratieResponseDto
            {
                Message = "Aanvoerder succesvol geregistreerd",
                GebruikerId = gebruiker.GebruikerId,
                AanvoerderId = aanvoerder.AanvoerderId
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
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

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // Maak Gebruiker aan
            var gebruiker = new Gebruiker
            {
                Naam = dto.Gebruikersnaam,
                WachtwoordHash = HashPassword(dto.Wachtwoord)
            };
            _db.Gebruikers.Add(gebruiker);
            await _db.SaveChangesAsync();

            // Maak Veilingmeester aan
            var veilingmeester = new Veilingmeester
            {
                GebruikerId = gebruiker.GebruikerId
            };
            _db.Veilingmeesters.Add(veilingmeester);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new RegistratieResponseDto
            {
                Message = "Veilingmeester succesvol geregistreerd",
                GebruikerId = gebruiker.GebruikerId,
                VeilingmeesterId = veilingmeester.VeilingmeesterId
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new ErrorResponseDto 
            { 
                Message = "Er is een fout opgetreden", 
                Error = ex.Message 
            });
        }
    }
}
