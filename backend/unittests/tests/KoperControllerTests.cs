using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using veilingklok;
using veilingklok.Models;
using Xunit;

namespace unittests;
public class KoperControllerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<VeilingContext> _contextOptions;
    private readonly Mock<UserManager<Gebruiker>> _userManagerMock;

    public KoperControllerTests()
    {
        // SQLite in-memory – zelfde patroon als andere controller tests
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _contextOptions = new DbContextOptionsBuilder<VeilingContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = new VeilingContext(_contextOptions);
        context.Database.EnsureCreated();
        context.SaveChanges();

        // Mock UserManager
        var store = new Mock<IUserStore<Gebruiker>>();
        _userManagerMock = new Mock<UserManager<Gebruiker>>(
            store.Object,
            null, null, null, null, null, null, null, null
        );
    }

    private KoperController CreateController()
    {
        var context = new VeilingContext(_contextOptions);
        return new KoperController(context, _userManagerMock.Object);
    }

    [Fact]
    public async Task Register_UsernameOrPasswordMissing_ReturnsBadRequest()
    {
        var controller = CreateController();

        var dto = new KoperRegistratie
        {
            UserName = "",
            Password = ""
        };

        var result = await controller.Register(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Register_CreateUserFails_ReturnsBadRequest()
    {
        _userManagerMock
            .Setup(u => u.CreateAsync(It.IsAny<Gebruiker>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Failed(
                new IdentityError { Description = "Create failed" }
            ));

        var controller = CreateController();

        var dto = new KoperRegistratie
        {
            UserName = "koper1",
            Password = "Password123!"
        };

        var result = await controller.Register(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Aanmaken van account mislukt", badRequest.Value!.ToString());
    }

    [Fact]
    public async Task Register_AddToRoleFails_ReturnsBadRequest()
    {
        _userManagerMock
            .Setup(u => u.CreateAsync(It.IsAny<Gebruiker>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock
            .Setup(u => u.AddToRoleAsync(It.IsAny<Gebruiker>(), "Koper"))
            .ReturnsAsync(IdentityResult.Failed(
                new IdentityError { Description = "Role failed" }
            ));

        var controller = CreateController();

        var dto = new KoperRegistratie
        {
            UserName = "koper1",
            Password = "Password123!"
        };

        var result = await controller.Register(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("toevoegen aan rol mislukt", badRequest.Value!.ToString());
    }

    [Fact]
    public async Task Register_ValidInput_ReturnsOk()
    {
        _userManagerMock
            .Setup(u => u.CreateAsync(It.IsAny<Gebruiker>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock
            .Setup(u => u.AddToRoleAsync(It.IsAny<Gebruiker>(), "Koper"))
            .ReturnsAsync(IdentityResult.Success);

        var controller = CreateController();

        var dto = new KoperRegistratie
        {
            UserName = "koper1",
            Password = "Password123!",
            KvkNummer = "87654321",
            Adres = "Koperstraat 1",
            Email = "koper@test.nl",
            IbanHash = "NL00TEST987654321"
        };

        var result = await controller.Register(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Contains("Koper succesvol geregistreerd", ok.Value!.ToString());
    }

    public void Dispose()
    {
        _connection.Close();
        _connection.Dispose();
    }
}
