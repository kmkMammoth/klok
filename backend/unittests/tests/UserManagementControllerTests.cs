using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using veilingklok;
using veilingklok.Models;
using Xunit;

public class UserManagementControllerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<VeilingContext> _contextOptions;

    public UserManagementControllerTests()
    {
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _contextOptions = new DbContextOptionsBuilder<VeilingContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = new VeilingContext(_contextOptions);
        context.Database.EnsureCreated();

        // Seed gebruiker
        context.Gebruiker.Add(new Gebruiker
        {
            Id = "u1",
            Naam = "TestGebruiker"
        });

        context.SaveChanges();
    }

    private UserManagementController CreateController()
    {
        var context = new VeilingContext(_contextOptions);
        return new UserManagementController(context);
    }

    [Fact]
    public async Task GetUser_ExistingUser_ReturnsUser()
    {
        var controller = CreateController();

        var result = await controller.GetUser("u1");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var users = Assert.IsAssignableFrom<IEnumerable<Gebruiker>>(ok.Value);

        Assert.Single(users);
        Assert.Equal("TestGebruiker", users.First().Naam);
    }

    [Fact]
    public async Task GetUser_NotExisting_ReturnsEmptyList()
    {
        var controller = CreateController();

        var result = await controller.GetUser("unknown");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var users = Assert.IsAssignableFrom<IEnumerable<Gebruiker>>(ok.Value);

        Assert.Empty(users);
    }

    [Fact]
    public async Task AddUser_ValidName_AddsUser()
    {
        var controller = CreateController();

        var result = await controller.AddUser("NieuweGebruiker");

        Assert.IsType<OkResult>(result.Result);

        using var context = new VeilingContext(_contextOptions);
        Assert.Equal(2, context.Gebruiker.Count());
    }

    [Fact]
    public async Task ChangeUser_ExistingUser_UpdatesName()
    {
        var controller = CreateController();

        var result = await controller.ChangeUser("u1", "GewijzigdeNaam");

        Assert.IsType<OkResult>(result.Result);

        using var context = new VeilingContext(_contextOptions);
        var user = context.Gebruiker.Single(u => u.Id == "u1");

        Assert.Equal("GewijzigdeNaam", user.Naam);
    }

    [Fact]
    public async Task DeleteUser_ExistingUser_RemovesUser()
    {
        var controller = CreateController();

        var result = await controller.DeleteUser("u1");

        Assert.IsType<OkResult>(result.Result);

        using var context = new VeilingContext(_contextOptions);
        Assert.Empty(context.Gebruiker);
    }

    public void Dispose()
    {
        _connection.Close();
        _connection.Dispose();
    }
}
