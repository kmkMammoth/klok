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

    private GekochtProductController CreateController(string? userId = null)
    {
        var context = CreateContext();
        var controller = new GekochtProductController(context);

        if (!string.IsNullOrEmpty(userId))
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        return controller;
    }

    [Fact]
    public async Task GetAll_ReturnsAllItems()
    {
        using var context = CreateContext();
        context.GekochtProduct.Add(new GekochtProduct
        {
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
    public async Task GetByProductId_Existing_ReturnsOk()
    {
        using var context = CreateContext();
        context.GekochtProduct.Add(new GekochtProduct
        {
            ProductId = 2,
            Hoeveelheid = 5,
            KoopPrijs = 12,
            GebruikerId = "1"
        });
        context.SaveChanges();

        var controller = CreateController("1");

        var result = await controller.GetByProductId(2);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var item = Assert.IsType<GekochtProduct>(ok.Value);

        Assert.Equal(2, item.ProductId);
    }

    [Fact]
    public async Task GetByProductId_NotExisting_ReturnsNotFound()
    {
        var controller = CreateController("1");

        var result = await controller.GetByProductId(999);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_Valid_ReturnsOk()
    {
        var controller = CreateController("1");

        var model = new GekochtProduct
        {
            ProductId = 3,
            Hoeveelheid = 4,
            KoopPrijs = 40
        };

        var result = await controller.Create(model);

        Assert.IsType<OkResult>(result);

        using var checkContext = CreateContext();
        Assert.Single(checkContext.GekochtProduct);
    }

    [Fact]
    public async Task Create_MissingFields_ReturnsBadRequest()
    {
        var controller = CreateController("1");

        var model = new GekochtProduct
        {
            ProductId = 4
        };

        var result = await controller.Create(model);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("verplicht", badRequest.Value!.ToString());
    }

    [Fact]
    public async Task Delete_Existing_ReturnsOk()
    {
        using var context = CreateContext();
        context.GekochtProduct.Add(new GekochtProduct
        {
            ProductId = 6,
            Hoeveelheid = 1,
            KoopPrijs = 5,
            GebruikerId = "1"
        });
        context.SaveChanges();

        var controller = CreateController("1");

        var result = await controller.Delete(6);

        Assert.IsType<OkResult>(result);

        using var checkContext = CreateContext();
        Assert.Empty(checkContext.GekochtProduct);
    }

    [Fact]
    public async Task Delete_NotExisting_ReturnsNotFound()
    {
        var controller = CreateController("1");

        var result = await controller.Delete(404);

        Assert.IsType<NotFoundResult>(result);
    }

    public void Dispose()
    {
        _connection.Close();
        _connection.Dispose();
    }
}
