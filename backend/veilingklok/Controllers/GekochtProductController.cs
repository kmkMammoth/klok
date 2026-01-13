using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class GekochtProductController : ControllerBase
{
    private readonly VeilingContext _db;

    public GekochtProductController(VeilingContext db)
    {
        _db = db;
    }

    // GET: api/GekochtProduct
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GekochtProduct>>> GetAll()
    {
        return Ok(await _db.GekochtProduct.ToListAsync());
    }

    // GET: api/GekochtProduct/{id}
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("{id}")]
    public async Task<ActionResult<GekochtProduct>> GetById(int id)
    {
        var item = await _db.GekochtProduct
            .SingleOrDefaultAsync(g => g.Id == id);

        if (item == null)
            return NotFound();

        return Ok(item);
    }

    // GET: api/GekochtProduct/product/{productId}
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<GekochtProduct>> GetByProductId(int productId)
    {
        var item = await _db.GekochtProduct
            .SingleOrDefaultAsync(g => g.ProductId == productId);

        if (item == null)
            return NotFound();

        return Ok(item);
    }

    // POST: api/GekochtProduct
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Koper, Admin")]
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] GekochtProduct model)
    {
        if (model == null ||
            model.ProductId == null ||
            model.Hoeveelheid == null ||
            model.KoopPrijs == null)
        {
            return BadRequest("Alle velden zijn verplicht.");
        }

        var gebruikerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (gebruikerId == null)
            return Unauthorized();

        // Sla de string-gebruiker-id (Identity user id) op in het GekochtProduct
        model.GebruikerId = gebruikerId;

        _db.GekochtProduct.Add(model);
        await _db.SaveChangesAsync();

        return Ok();
    }

    // DELETE: api/GekochtProduct/{id}
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var item = await _db.GekochtProduct
            .SingleOrDefaultAsync(g => g.Id == id);

        if (item == null)
            return NotFound();

        _db.GekochtProduct.Remove(item);
        await _db.SaveChangesAsync();

        return Ok();
    }
}
