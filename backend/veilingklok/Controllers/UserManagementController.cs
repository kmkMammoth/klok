using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;

namespace veilingklok;

[ApiController]
[Route("api/[controller]")]
public class UserManagementController : ControllerBase
{
    private readonly VeilingContext _db;
    private readonly UserManager<Gebruiker> _userManager;

    public UserManagementController(VeilingContext db, UserManager<Gebruiker> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    // GET: api/UserManagement/role
    // Zonder token => 401 (geen 500)
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("role")]
    public async Task<ActionResult<IList<string>>> GetUserRole()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized("User is not logged in.");

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(roles);
    }

    // GET: api/UserManagement/user
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("user")]
    public async Task<ActionResult<Gebruiker>> GetUser()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized("User is not logged in.");

        return Ok(user);
    }

    [HttpPost("user")]
    public async Task<ActionResult> AddUser(string name)
    {
        _db.Add(new Gebruiker { Naam = name });
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPut]
    public async Task<ActionResult> ChangeUser(string id, string name)
    {
        var user = await _db.Gebruiker.Where(g => g.Id == id).SingleAsync();
        user.Naam = name;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete]
    public async Task<ActionResult> DeleteUser(string id)
    {
        var user = await _db.Gebruiker.Where(g => g.Id == id).SingleAsync();
        _db.Remove(user);
        await _db.SaveChangesAsync();
        return Ok();
    }
}