using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;
using BCrypt.Net;

namespace veilingklok.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly VeilingContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(VeilingContext context, ILogger<AuthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new LoginResponseDto
                    {
                        Success = false,
                        Message = "Validatie gefaald"
                    });
                }

                // Find user by username
                var gebruiker = await _context.Gebruikers
                    .FirstOrDefaultAsync(g => g.Naam == dto.Username);

                if (gebruiker == null)
                {
                    return Unauthorized(new LoginResponseDto
                    {
                        Success = false,
                        Message = "Ongeldige gebruikersnaam of wachtwoord"
                    });
                }

                // Verify password
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, gebruiker.WachtwoordHash);
                if (!isPasswordValid)
                {
                    return Unauthorized(new LoginResponseDto
                    {
                        Success = false,
                        Message = "Ongeldige gebruikersnaam of wachtwoord"
                    });
                }

                // Determine user role and get additional details
                UserDetailsDto userDetails = null;
                string role = null;
                int? roleId = null;

                // Check if Veilingmeester
                var veilingmeester = await _context.Veilingmeesters
                    .FirstOrDefaultAsync(v => v.GebruikerId == gebruiker.GebruikerId);
                
                if (veilingmeester != null)
                {
                    role = "veilingmeester";
                    roleId = veilingmeester.VeilingmeesterId;
                    userDetails = new UserDetailsDto
                    {
                        GebruikerId = gebruiker.GebruikerId,
                        Naam = gebruiker.Naam,
                        Role = role,
                        RoleId = roleId
                    };
                }
                else
                {
                    // Check if Koper
                    var koper = await _context.Kopers
                        .FirstOrDefaultAsync(k => k.GebruikerId == gebruiker.GebruikerId);
                    
                    if (koper != null)
                    {
                        role = "koper";
                        roleId = koper.KoperId;
                        userDetails = new UserDetailsDto
                        {
                            GebruikerId = gebruiker.GebruikerId,
                            Naam = gebruiker.Naam,
                            Role = role,
                            RoleId = roleId,
                            Email = koper.Email,
                            KvkNummer = koper.KvkNummer,
                            Adres = koper.Adres
                        };
                    }
                    else
                    {
                        // Check if Aanvoerder
                        var aanvoerder = await _context.Aanvoerders
                            .FirstOrDefaultAsync(a => a.GebruikerId == gebruiker.GebruikerId);
                        
                        if (aanvoerder != null)
                        {
                            role = "aanvoerder";
                            roleId = aanvoerder.AanvoerderId;
                            userDetails = new UserDetailsDto
                            {
                                GebruikerId = gebruiker.GebruikerId,
                                Naam = gebruiker.Naam,
                                Role = role,
                                RoleId = roleId,
                                Email = aanvoerder.Email,
                                KvkNummer = aanvoerder.KvkNummer,
                                Adres = aanvoerder.Adres
                            };
                        }
                    }
                }

                if (role == null)
                {
                    return BadRequest(new LoginResponseDto
                    {
                        Success = false,
                        Message = "Gebruiker heeft geen toegewezen rol"
                    });
                }

                _logger.LogInformation($"User {gebruiker.Naam} logged in as {role}");

                return Ok(new LoginResponseDto
                {
                    Success = true,
                    Message = "Login succesvol",
                    Role = role,
                    UserId = gebruiker.GebruikerId,
                    Name = gebruiker.Naam,
                    UserDetails = userDetails
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login error: {ex.Message}");
                return StatusCode(500, new LoginResponseDto
                {
                    Success = false,
                    Message = "Er is een fout opgetreden bij het inloggen"
                });
            }
        }

        // Optional: Logout endpoint (for future use with tokens)
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { success = true, message = "Uitgelogd" });
        }
    }
}


