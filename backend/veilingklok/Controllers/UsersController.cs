using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace veilingklok.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly VeilingContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(VeilingContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/users/all - Get all users (for testing)
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var gebruikers = await _context.Gebruikers
                    .Select(g => new
                    {
                        g.GebruikerId,
                        g.Naam,
                        HasPassword = !string.IsNullOrEmpty(g.WachtwoordHash)
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    count = gebruikers.Count,
                    users = gebruikers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting users: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error retrieving users" });
            }
        }

        // GET: api/users/veilingmeesters
        [HttpGet("veilingmeesters")]
        public async Task<IActionResult> GetVeilingmeesters()
        {
            try
            {
                var veilingmeesters = await _context.Veilingmeesters
                    .Include(v => v.Gebruiker)
                    .Select(v => new
                    {
                        v.VeilingmeesterId,
                        v.GebruikerId,
                        Naam = v.Gebruiker.Naam
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    count = veilingmeesters.Count,
                    veilingmeesters
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting veilingmeesters: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error retrieving veilingmeesters" });
            }
        }

        // GET: api/users/kopers
        [HttpGet("kopers")]
        public async Task<IActionResult> GetKopers()
        {
            try
            {
                var kopers = await _context.Kopers
                    .Include(k => k.Gebruiker)
                    .Select(k => new
                    {
                        k.KoperId,
                        k.GebruikerId,
                        Naam = k.Gebruiker.Naam,
                        k.Email,
                        k.KvkNummer,
                        k.Adres
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    count = kopers.Count,
                    kopers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting kopers: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error retrieving kopers" });
            }
        }

        // GET: api/users/aanvoerders
        [HttpGet("aanvoerders")]
        public async Task<IActionResult> GetAanvoerders()
        {
            try
            {
                var aanvoerders = await _context.Aanvoerders
                    .Include(a => a.Gebruiker)
                    .Select(a => new
                    {
                        a.AanvoerderId,
                        a.GebruikerId,
                        Naam = a.Gebruiker.Naam,
                        a.Email,
                        a.KvkNummer,
                        a.Adres
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    count = aanvoerders.Count,
                    aanvoerders
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting aanvoerders: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error retrieving aanvoerders" });
            }
        }

        // GET: api/users/stats - Get user statistics
        [HttpGet("stats")]
        public async Task<IActionResult> GetUserStats()
        {
            try
            {
                var stats = new
                {
                    totalGebruikers = await _context.Gebruikers.CountAsync(),
                    totalVeilingmeesters = await _context.Veilingmeesters.CountAsync(),
                    totalKopers = await _context.Kopers.CountAsync(),
                    totalAanvoerders = await _context.Aanvoerders.CountAsync()
                };

                return Ok(new
                {
                    success = true,
                    stats
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting stats: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error retrieving stats" });
            }
        }
    }
}

