using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;
using BCrypt.Net;

namespace veilingklok.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegisterController : ControllerBase
    {
        private readonly VeilingContext _context;
        private readonly ILogger<RegisterController> _logger;

        public RegisterController(VeilingContext context, ILogger<RegisterController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Register Koper (Buyer)
        [HttpPost("koper")]
        public async Task<ActionResult<RegisterResponseDto>> RegisterKoper([FromBody] RegisterKoperDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new RegisterResponseDto
                    {
                        Success = false,
                        Message = "Validatie gefaald: " + string.Join(", ", ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage))
                    });
                }

                // Check if user already exists (by email or KvK)
                var existingEmail = await _context.Kopers
                    .FirstOrDefaultAsync(k => k.Email == dto.Email);
                if (existingEmail != null)
                {
                    return BadRequest(new RegisterResponseDto
                    {
                        Success = false,
                        Message = "E-mailadres is al geregistreerd"
                    });
                }

                var existingKvk = await _context.Kopers
                    .FirstOrDefaultAsync(k => k.KvkNummer == dto.KvkNummer);
                if (existingKvk != null)
                {
                    return BadRequest(new RegisterResponseDto
                    {
                        Success = false,
                        Message = "KvK-nummer is al geregistreerd"
                    });
                }

                // Hash password
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Wachtwoord);
                // Hash IBAN for security
                string ibanHash = BCrypt.Net.BCrypt.HashPassword(dto.Iban);

                // Create Gebruiker
                var gebruiker = new Gebruiker
                {
                    Naam = dto.Bedrijfsnaam,
                    WachtwoordHash = passwordHash
                };

                _context.Gebruikers.Add(gebruiker);
                await _context.SaveChangesAsync();

                // Create Koper
                var koper = new Koper
                {
                    GebruikerId = gebruiker.GebruikerId,
                    KvkNummer = dto.KvkNummer,
                    Adres = dto.Bedrijfsadres,
                    Email = dto.Email,
                    IbanHash = ibanHash
                };

                _context.Kopers.Add(koper);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Nieuwe koper geregistreerd: {dto.Bedrijfsnaam}");

                return Ok(new RegisterResponseDto
                {
                    Success = true,
                    Message = "Koper account succesvol aangemaakt",
                    Role = "koper",
                    UserId = gebruiker.GebruikerId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error registering koper: {ex.Message}");
                return StatusCode(500, new RegisterResponseDto
                {
                    Success = false,
                    Message = "Er is een fout opgetreden bij het aanmaken van het account"
                });
            }
        }

        // Register Aanvoerder (Supplier)
        [HttpPost("aanvoerder")]
        public async Task<ActionResult<RegisterResponseDto>> RegisterAanvoerder([FromBody] RegisterAanvoerderDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new RegisterResponseDto
                    {
                        Success = false,
                        Message = "Validatie gefaald: " + string.Join(", ", ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage))
                    });
                }

                // Check if user already exists
                var existingEmail = await _context.Aanvoerders
                    .FirstOrDefaultAsync(a => a.Email == dto.Email);
                if (existingEmail != null)
                {
                    return BadRequest(new RegisterResponseDto
                    {
                        Success = false,
                        Message = "E-mailadres is al geregistreerd"
                    });
                }

                var existingKvk = await _context.Aanvoerders
                    .FirstOrDefaultAsync(a => a.KvkNummer == dto.KvkNummer);
                if (existingKvk != null)
                {
                    return BadRequest(new RegisterResponseDto
                    {
                        Success = false,
                        Message = "KvK-nummer is al geregistreerd"
                    });
                }

                // Hash password and IBAN
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Wachtwoord);
                string ibanHash = BCrypt.Net.BCrypt.HashPassword(dto.Iban);

                // Create Gebruiker
                var gebruiker = new Gebruiker
                {
                    Naam = dto.Bedrijfsnaam,
                    WachtwoordHash = passwordHash
                };

                _context.Gebruikers.Add(gebruiker);
                await _context.SaveChangesAsync();

                // Create Aanvoerder
                var aanvoerder = new Aanvoerder
                {
                    GebruikerId = gebruiker.GebruikerId,
                    KvkNummer = dto.KvkNummer,
                    Adres = dto.Bedrijfsadres,
                    Email = dto.Email,
                    IbanHash = ibanHash
                };

                _context.Aanvoerders.Add(aanvoerder);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Nieuwe aanvoerder geregistreerd: {dto.Bedrijfsnaam}");

                return Ok(new RegisterResponseDto
                {
                    Success = true,
                    Message = "Aanvoerder account succesvol aangemaakt",
                    Role = "aanvoerder",
                    UserId = gebruiker.GebruikerId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error registering aanvoerder: {ex.Message}");
                return StatusCode(500, new RegisterResponseDto
                {
                    Success = false,
                    Message = "Er is een fout opgetreden bij het aanmaken van het account"
                });
            }
        }

        // Register Veilingmeester (Auctioneer)
        [HttpPost("veilingmeester")]
        public async Task<ActionResult<RegisterResponseDto>> RegisterVeilingmeester([FromBody] RegisterVeilingmeesterDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new RegisterResponseDto
                    {
                        Success = false,
                        Message = "Validatie gefaald: " + string.Join(", ", ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage))
                    });
                }

                // Check if username already exists
                var existingUser = await _context.Gebruikers
                    .FirstOrDefaultAsync(g => g.Naam == dto.Gebruikersnaam);
                if (existingUser != null)
                {
                    return BadRequest(new RegisterResponseDto
                    {
                        Success = false,
                        Message = "Gebruikersnaam is al in gebruik"
                    });
                }

                // Hash password
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Wachtwoord);

                // Create Gebruiker
                var gebruiker = new Gebruiker
                {
                    Naam = dto.Gebruikersnaam,
                    WachtwoordHash = passwordHash
                };

                _context.Gebruikers.Add(gebruiker);
                await _context.SaveChangesAsync();

                // Create Veilingmeester
                var veilingmeester = new Veilingmeester
                {
                    GebruikerId = gebruiker.GebruikerId
                };

                _context.Veilingmeesters.Add(veilingmeester);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Nieuwe veilingmeester geregistreerd: {dto.Gebruikersnaam}");

                return Ok(new RegisterResponseDto
                {
                    Success = true,
                    Message = "Veilingmeester account succesvol aangemaakt",
                    Role = "veilingmeester",
                    UserId = gebruiker.GebruikerId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error registering veilingmeester: {ex.Message}");
                return StatusCode(500, new RegisterResponseDto
                {
                    Success = false,
                    Message = "Er is een fout opgetreden bij het aanmaken van het account"
                });
            }
        }
    }
}

