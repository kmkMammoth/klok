using Microsoft.AspNetCore.Mvc;

namespace veilingklok.Controllers
{
    /// <summary>
    /// Biedt server-UTC-tijd voor client-synchronisatie in veilingafloop.
    /// Essentieel voor nauwkeurige prijsberekening en countdown-timing.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TimeController : ControllerBase
    {
        /// <summary>
        /// Retourneer huidge server UTC-tijd.
        /// Clients gebruiken dit voor offset-sync met lokale prijsberekening.
        /// </summary>
        [HttpGet]
        public ActionResult<object> GetServerTime()
        {
            var now = DateTime.UtcNow;
            return Ok(new { utcNow = now });
        }
    }
}
