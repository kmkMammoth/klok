using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using veilingklok.Models;

namespace veilingklok;

/// <summary>
/// Beheert gebruiker-metadata: rol, ID, profiel en CRUD-operaties.
/// Alle endpoints vereisen Bearer-authenticatie.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UserManagementController : ControllerBase
{
    // DbContext en UserManager worden via DI aangeleverd.
    private readonly VeilingContext _db;
    private readonly UserManager<Gebruiker> _userManager;

    public UserManagementController(VeilingContext db, UserManager<Gebruiker> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    /// <summary>
    /// Retourneer rollen van ingelogde gebruiker.
    /// Vereist Bearer-token; retourneert 401 zonder valide token.
    /// </summary>
    // GET: api/UserManagement/role
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("role")]
    public async Task<ActionResult<IList<string>>> GetUserRole()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized("User is not logged in.");

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(roles);
    }
    
    /// <summary>
    /// Retourneer gebruiker-ID van ingelogde gebruiker.
    /// </summary>
    // GET: api/UserManagement/id
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("id")]
    public async Task<ActionResult<string>> GetLoggedInUserId()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized("User is not logged in.");
        }

        return Ok(user.Id);
    }
    
    /// <summary>
    /// Retourneer profiel van ingelogde gebruiker.
    /// </summary>
    // GET: api/UserManagement/user
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    [HttpGet("user")]
    public async Task<ActionResult<Gebruiker>> GetUser()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized("User is not logged in.");

        return Ok(user);
    /// <summary>
    /// Voeg nieuwe gebruiker toe met gegeven naam.
    /// </summary>
    }

    [HttpPost("user")]
    public async Task<ActionResult> AddUser(string name)
    {
        _db.Add(new Gebruiker { Naam = name });
        await _db.SaveChangesAsync();
    /// <summary>
    /// Wijzig naam van gebruiker met gegeven ID.
    /// </summary>
        return Ok();
    }

    [HttpPut]
    public async Task<ActionResult> ChangeUser(string id, string name)
    {
    /// <summary>
    /// Verwijder gebruiker met gegeven ID.
    /// </summary>
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