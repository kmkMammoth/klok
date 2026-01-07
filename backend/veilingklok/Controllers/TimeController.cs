using Microsoft.AspNetCore.Mvc;

namespace veilingklok.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimeController : ControllerBase
    {
        [HttpGet]
        public ActionResult<object> GetServerTime()
        {
            var now = DateTime.UtcNow;
            return Ok(new { utcNow = now });
        }
    }
}
