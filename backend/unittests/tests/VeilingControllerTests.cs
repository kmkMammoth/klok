using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using veilingklok;
using veilingklok.Models;
using veilingklok.Services;
using Xunit;

namespace unittests;

public class VeilingControllerTests
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<VeilingContext> _contextOptions;
    private readonly Mock<IAuctionManager> _auctionManagerMock;

    public VeilingControllerTests()
    {
        _auctionManagerMock = new Mock<IAuctionManager>();
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _contextOptions = new DbContextOptionsBuilder<VeilingContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = new VeilingContext(_contextOptions);
        context.Database.EnsureCreated();

        // Seed Aanvoerder (VERPLICHT voor Product)
        var aanvoerder = new Aanvoerder
        {
            Id = "a1",
            Naam = "TestAanvoerder",
            KvkNummer = "12345678",
            Adres = "TestAdres",
            Email = "test@test.test",
            IbanHash = "NL00 INGB 012345678"
        };
        context.Aanvoerder.Add(aanvoerder);

        // Seed Veilingmeester
        var veilingmeester = new Veilingmeester
        {
            Id = "v1",
            Naam = "TestVeilingmeester"
        };
        context.Veilingmeester.Add(veilingmeester);

        // Seed Veiling
        var veiling = new Veiling
        {
            VeilingId = 1,
            VeilingNaam = "TestVeiling",
            Status = "Idle",
            MinimumPrijs = 10,
            StartTijd = DateTime.Now,
            EindTijd = DateTime.Now.AddSeconds(60),
            Gebruiker_id = "v1"
        };
        context.Veiling.Add(veiling);

        // Seed Product (NU MET VERPLICHTE AANVOERDER)
        context.Product.Add(new Product
        {
            ArtikelId = 1,
            Soort = "Roos",
            Gebruiker_id = "a1",        // 🔴 essentieel
            Aanvoerder = aanvoerder,    // 🔴 essentieel
            VeilingId = 1,
            StartPrijs = 15,
            IncrementPerSecond = 0.5m
        });

        context.SaveChanges();
    }
    
    private VeilingContext CreateContext() => new VeilingContext(_contextOptions);

    [Fact]
    public async Task GetAllAuctions_ReturnsAllAuctions()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        var result = await controller.GetAllAuctions();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<AuctionResponse>>(ok.Value);
        Assert.Single(list);
    }

    [Fact]
    public async Task GetAuction_ExistingAuction_ReturnsOk()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        var result = await controller.GetAuction(1);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var auction = Assert.IsType<AuctionResponse>(ok.Value);
        Assert.Equal("TestVeiling", auction.name);
    }

    [Fact]
    public async Task GetAuction_NotExisting_ReturnsNotFound()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        var result = await controller.GetAuction(999);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task AddAuction_ValidInput_ReturnsOk()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        // simulate authenticated veilingmeester
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "v1") }, "TestAuth"))
            }
        };

        var request = new CreateAuctionRequest
        {
            name = "NieuweVeiling",
            maxTime = 120,
            startingPrice = 25
        };

        var result = await controller.AddAuction(request);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var auction = Assert.IsType<AuctionResponse>(ok.Value);
        Assert.Equal("NieuweVeiling", auction.name);
        Assert.Equal(2, context.Veiling.Count());
    }

    [Fact]
    public async Task AddAuction_InvalidInput_ReturnsBadRequest()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        var request = new CreateAuctionRequest
        {
            name = "",
            maxTime = -1,
            startingPrice = -5
        };

        var result = await controller.AddAuction(request);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task AddAuction_NonExistingVeilingmeester_ReturnsBadRequest()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        // No authenticated user -> expect Unauthorized
        // provide an empty principal (no NameIdentifier claim) so FindFirstValue doesn't throw
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity())
            }
        };

        var request = new CreateAuctionRequest
        {
            name = "VeilingX",
            maxTime = 60,
            startingPrice = 10
        };

        var result = await controller.AddAuction(request);
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task UpdateAuction_ExistingAuction_UpdatesStatus()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        var result = await controller.UpdateAuction(1, "Running");

        Assert.IsType<OkResult>(result);
        Assert.Equal("Running", context.Veiling.Single(v => v.VeilingId == 1).Status);
    }

    [Fact]
    public async Task UpdateAuction_NotExisting_ReturnsNotFound()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        var result = await controller.UpdateAuction(999, "Running");

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteAuction_ExistingAuction_RemovesAuctionAndClearsProducts()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        var result = await controller.DeleteAuction(1);

        Assert.IsType<OkResult>(result);

        Assert.Null(context.Veiling.SingleOrDefault(v => v.VeilingId == 1));

        var product = context.Product.Single(p => p.ArtikelId == 1);
        Assert.Null(product.VeilingId);
        Assert.Null(product.StartPrijs);
        Assert.Null(product.IncrementPerSecond);
    }

    [Fact]
    public async Task DeleteAuction_NotExisting_ReturnsNotFound()
    {
        using var context = CreateContext();
        var controller = new AuctionsController(context, _auctionManagerMock.Object);

        var result = await controller.DeleteAuction(999);

        Assert.IsType<NotFoundResult>(result);
    }
}
