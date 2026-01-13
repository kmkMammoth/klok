using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using veilingklok;
using veilingklok.Models;
using Xunit;

namespace unittests;

public class GekochtProductControllerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<VeilingContext> _contextOptions;

    public GekochtProductControllerTests()
    {
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _contextOptions = new DbContextOptionsBuilder<VeilingContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = new VeilingContext(_contextOptions);
        context.Database.EnsureCreated();
    }

    private VeilingContext CreateContext() => new VeilingContext(_contextOptions);

    private GekochtProductController CreateController(string userId, string? role = null)
    {
        var context = CreateContext();
        // Create a small stub auction manager that will insert a GekochtProduct into the same in-memory DB
        var auctionManager = new StubAuctionManager(() => CreateContext());
        var controller = new GekochtProductController(context, auctionManager);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        };

        if (!string.IsNullOrEmpty(role))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };

        return controller;
    }

    private class StubAuctionManager : veilingklok.Services.IAuctionManager
    {
        private readonly Func<VeilingContext> _ctxFactory;
        public StubAuctionManager(Func<VeilingContext> ctxFactory) { _ctxFactory = ctxFactory; }
        public Task StartAuctionAsync(int veilingId) => Task.CompletedTask;
        public Task StartNextProductAsync(int veilingId) => Task.CompletedTask;
        public async Task<bool> TryBuyProductAsync(int productId, string buyerId, int hoeveelheid = 1, decimal? offeredPrice = null)
        {
            using var ctx = _ctxFactory();
            var gp = new GekochtProduct { ProductId = productId, GebruikerId = buyerId, Hoeveelheid = hoeveelheid, KoopPrijs = offeredPrice ?? 0m };
            ctx.GekochtProduct.Add(gp);
            await ctx.SaveChangesAsync();
            return true;
        }
    }

    [Fact]
    public async Task GetAll_ReturnsAllItems()
    {
        using var context = CreateContext();
        context.GekochtProduct.Add(new GekochtProduct
        {
            Id = 1,
            ProductId = 1,
            Hoeveelheid = 10,
            KoopPrijs = 25,
            GebruikerId = "1"
        });
        context.SaveChanges();

        var controller = CreateController("1");

        var result = await controller.GetAll();
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var items = Assert.IsAssignableFrom<List<GekochtProduct>>(ok.Value);

        Assert.Single(items);
    }

    [Fact]
    public async Task GetById_Existing_ReturnsOk()
    {
        using var context = CreateContext();
        context.GekochtProduct.Add(new GekochtProduct
        {
            Id = 2,
            ProductId = 2,
            Hoeveelheid = 5,
            KoopPrijs = 12,
            GebruikerId = "1"
        });
        context.SaveChanges();

        var controller = CreateController("1");

        var result = await controller.GetById(2);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var item = Assert.IsType<GekochtProduct>(ok.Value);

        Assert.Equal(2, item.Id);
    }

    [Fact]
    public async Task GetById_NotExisting_ReturnsNotFound()
    {
        var controller = CreateController("1");

        var result = await controller.GetById(999);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetByProductId_Existing_ReturnsOk()
    {
        using var context = CreateContext();
        context.GekochtProduct.Add(new GekochtProduct
        {
            Id = 10,
            ProductId = 99,
            Hoeveelheid = 2,
            KoopPrijs = 7,
            GebruikerId = "1"
        });
        context.SaveChanges();

        var controller = CreateController("1");

        var result = await controller.GetByProductId(99);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var item = Assert.IsType<GekochtProduct>(ok.Value);

        Assert.Equal(99, item.ProductId);
    }

    [Fact]
    public async Task GetByProductId_NotExisting_ReturnsNotFound()
    {
        var controller = CreateController("1");

        var result = await controller.GetByProductId(9999);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_Valid_ReturnsOk()
    {
        var controller = CreateController("1");

        var dto = new GekochtProductCreateDto
        {
            ProductId = 3,
            Hoeveelheid = 4,
            KoopPrijs = 40
        };

        var result = await controller.Create(dto);

        Assert.IsType<OkResult>(result);

        using var checkContext = CreateContext();
        Assert.Single(checkContext.GekochtProduct);
    }

    [Fact]
    public async Task Delete_Existing_Admin_ReturnsOk()
    {
        using var context = CreateContext();
        context.GekochtProduct.Add(new GekochtProduct
        {
            Id = 6,
            ProductId = 6,
            Hoeveelheid = 1,
            KoopPrijs = 5,
            GebruikerId = "1"
        });
        context.SaveChanges();

        var controller = CreateController("admin1", role: "Admin");

        var result = await controller.Delete(6);

        Assert.IsType<OkResult>(result);

        using var checkContext = CreateContext();
        Assert.Empty(checkContext.GekochtProduct);
    }

    [Fact]
    public async Task Delete_NotExisting_ReturnsNotFound()
    {
        var controller = CreateController("admin1", role: "Admin");

        var result = await controller.Delete(404);

        Assert.IsType<NotFoundResult>(result);
    }

    public void Dispose()
    {
        _connection.Close();
        _connection.Dispose();
    }
}