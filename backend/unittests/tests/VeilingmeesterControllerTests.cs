using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using veilingklok;
using veilingklok.Models;
using Xunit;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace unittests;

public class VeilingmeesterControllerTests
{
    private readonly Mock<UserManager<Gebruiker>> _mockUserManager;

    public VeilingmeesterControllerTests()
    {
        var store = new Mock<IUserStore<Gebruiker>>();
        _mockUserManager = new Mock<UserManager<Gebruiker>>(
            store.Object, null, null, null, null, null, null, null, null);
    }

    private VeilingmeesterController CreateController() =>
        new VeilingmeesterController(null, _mockUserManager.Object);

    [Fact]
    public async Task Register_ValidInput_ReturnsOk()
    {
        var dto = new VeilingmeesterRegistratie
        {
            UserName = "vm1",
            Password = "P@ssword1"
        };

        _mockUserManager
            .Setup(m => m.CreateAsync(It.IsAny<Veilingmeester>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        _mockUserManager
            .Setup(m => m.AddToRoleAsync(It.IsAny<Veilingmeester>(), "Veilingmeester"))
            .ReturnsAsync(IdentityResult.Success);

        var controller = CreateController();
        var result = await controller.Register(dto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        // ToString() werkt hier prima omdat we alleen de message checken
        Assert.Contains("Veilingmeester succesvol geregistreerd", okResult.Value!.ToString());
    }

    [Fact]
    public async Task Register_MissingUserNameOrPassword_ReturnsBadRequest()
    {
        var controller = CreateController();

        var dto1 = new VeilingmeesterRegistratie { UserName = "", Password = "pass" };
        var dto2 = new VeilingmeesterRegistratie { UserName = "user", Password = "" };

        var result1 = await controller.Register(dto1);
        var result2 = await controller.Register(dto2);

        Assert.IsType<BadRequestObjectResult>(result1);
        Assert.IsType<BadRequestObjectResult>(result2);
    }

    [Fact]
    public async Task Register_CreateFails_ReturnsBadRequest()
    {
        var dto = new VeilingmeesterRegistratie { UserName = "vm1", Password = "pass" };

        _mockUserManager
            .Setup(m => m.CreateAsync(It.IsAny<Veilingmeester>(), dto.Password))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Fout bij aanmaken" }));

        var controller = CreateController();
        var result = await controller.Register(dto);

        var badResult = Assert.IsType<BadRequestObjectResult>(result);

        // Reflection om de 'errors' property uit het anonymous object te halen
        var errorsProperty = badResult.Value!.GetType().GetProperty("errors");
        var errors = ((IEnumerable<string>)errorsProperty!.GetValue(badResult.Value)!);

        Assert.Contains("Fout bij aanmaken", errors);
    }

    [Fact]
    public async Task Register_AddToRoleFails_ReturnsBadRequest()
    {
        var dto = new VeilingmeesterRegistratie { UserName = "vm1", Password = "pass" };

        _mockUserManager
            .Setup(m => m.CreateAsync(It.IsAny<Veilingmeester>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        _mockUserManager
            .Setup(m => m.AddToRoleAsync(It.IsAny<Veilingmeester>(), "Veilingmeester"))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Fout bij rol" }));

        var controller = CreateController();
        var result = await controller.Register(dto);

        var badResult = Assert.IsType<BadRequestObjectResult>(result);

        // Reflection om de 'errors' property uit het anonymous object te halen
        var errorsProperty = badResult.Value!.GetType().GetProperty("errors");
        var errors = ((IEnumerable<string>)errorsProperty!.GetValue(badResult.Value)!);

        Assert.Contains("Fout bij rol", errors);
    }
}
