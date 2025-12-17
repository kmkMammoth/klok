using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using veilingklok;
using veilingklok.Models;
using Microsoft.AspNetCore.Mvc;
using unittests;

public class ProductsControllerTests
{
    private SqliteConnection _connection;
    private DbContextOptions<VeilingContext> _contextOptions;

    public ProductsControllerTests()
    {
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _contextOptions = new DbContextOptionsBuilder<VeilingContext>()
            .UseSqlite(_connection)
            .Options;

        // Database aanmaken en seed data toevoegen
        using var context = new VeilingContext(_contextOptions);
        context.Database.EnsureCreated();

        // Seed data with required fields
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

        var veilingmeester = new Veilingmeester { Id = "v1", Naam = "TestVeilingmeester" };
        context.Veilingmeester.Add(veilingmeester);

        var koper = new Koper
        {
            Id = "k1",
            Naam = "TestKoper",
            KvkNummer = "12345678",
            Adres = "TestAdres",
            Email = "test@test.test",
            IbanHash = "NL00 INGB 0123456789"
        };
        context.Koper.Add(koper);

        context.Product.AddRange(
            new Product { ArtikelId = 1, Soort = "Roos", Gebruiker_id = "a1", MinimumPrijs = 10, Aanvoerder = aanvoerder },
            new Product { ArtikelId = 2, Soort = "Tulp", Gebruiker_id = "a1", MinimumPrijs = 15, Aanvoerder = aanvoerder }
        );

        context.SaveChanges();
    }


    private VeilingContext CreateContext() => new VeilingContext(_contextOptions);

    [Fact]
    public async Task GetAllProducts_ReturnsAllProducts()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var result = await controller.GetAllProducts();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<ProductResponse>>(okResult.Value);
        Assert.Equal(2, list.Count);
    }

    [Fact]
    public async Task GetProduct_ProductExists_ReturnsOk()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var result = await controller.GetProduct(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var product = Assert.IsType<ProductResponse>(okResult.Value);
        Assert.Equal("Roos", product.soort);
    }

    [Fact]
    public async Task GetProduct_ProductDoesNotExist_ReturnsNotFound()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var result = await controller.GetProduct(99);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task AddProduct_ValidInput_ReturnsOk()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var request = new CreateProductRequest
        {
            soort = "Plant",
            gebruikerId = "a1",
            minimumprijs = 5
        };

        var result = await controller.AddProduct(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var product = Assert.IsType<ProductResponse>(okResult.Value);
        Assert.Equal("Plant", product.soort);

        // Check dat product ook echt in DB zit
        Assert.Equal(3, context.Product.Count());
    }

    [Fact]
    public async Task AddProduct_InvalidMinimumPrice_ReturnsBadRequest()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var request = new CreateProductRequest
        {
            soort = "Plant",
            gebruikerId = "a1",
            minimumprijs = -5
        };

        var result = await controller.AddProduct(request);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task DeleteProduct_ProductExists_RemovesProduct()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var result = await controller.DeleteProduct(1);
        Assert.IsType<OkResult>(result);

        Assert.Null(context.Product.SingleOrDefault(p => p.ArtikelId == 1));
    }

    [Fact]
    public async Task DeleteProduct_ProductDoesNotExist_ReturnsNotFound()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var result = await controller.DeleteProduct(99);
        Assert.IsType<NotFoundObjectResult>(result);
    }

    // --- New Validation / Bad Input Tests ---
    [Fact]
    public async Task AddProduct_MissingSoort_ReturnsBadRequest()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var request = new CreateProductRequest
        {
            gebruikerId = "a1",
            minimumprijs = 5
        };

        var result = await controller.AddProduct(request);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task AddProduct_MissingGebruikerId_ReturnsBadRequest()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var request = new CreateProductRequest
        {
            soort = "Plant",
            minimumprijs = 5
        };

        var result = await controller.AddProduct(request);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task UpdateProduct_NegativeMinimumPrijs_ReturnsBadRequest()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        var request = new CreateProductRequest
        {
            minimumprijs = -10
        };

        var result = await controller.UpdateProduct(1, request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // --- New Boundary / Edge Case Tests ---
    [Fact]
    public async Task GetAllProducts_NoProducts_ReturnsEmptyList()
    {
        using var context = CreateContext();

        // Delete all products
        context.Product.RemoveRange(context.Product);
        context.SaveChanges();

        var controller = new ProductsController(context);
        var result = await controller.GetAllProducts();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<ProductResponse>>(okResult.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task DeleteProduct_DeletingTwice_ReturnsNotFoundSecondTime()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);

        // First deletion should succeed
        var firstResult = await controller.DeleteProduct(1);
        Assert.IsType<OkResult>(firstResult);

        // Second deletion should return NotFound
        var secondResult = await controller.DeleteProduct(1);
        Assert.IsType<NotFoundObjectResult>(secondResult);
    }

    // --- New Combined / Integration-like Tests ---
    [Fact]
    public async Task AddProduct_AssignVeilingAndKoper_FullWorkflow()
    {
        using var context = CreateContext();
        var controller = new ProductsController(context);
    
        // Add product
        var addRequest = new CreateProductRequest
        {
            soort = "Orchidee",
            gebruikerId = "a1",
            minimumprijs = 20
        };

        var addResult = await controller.AddProduct(addRequest);
        var product = Assert.IsType<ProductResponse>(((OkObjectResult)addResult.Result).Value);

        // Create veiling and koper
        var veiling = new Veiling {
            VeilingId = 1,
            Gebruiker_id = "v1",
            Status = "Idle",
            VeilingNaam = "Naam"
        };
        context.Veiling.Add(veiling);
        
        var koper = new Koper
        {
            Id = "k2",
            Naam = "TestKoper",
            KvkNummer = "12345678",
            Adres = "TestAdres",
            Email = "test@test.test",
            IbanHash = "NL00 INGB 0123456789"
        };
        context.Koper.Add(koper);
        context.SaveChanges();

        // Assign veiling
        var veilingRequest = new UpdateProductVeiling { veilingId = veiling.VeilingId, startprijs = 25, incrementPerSecond = 0.5m };
        var assignVeilingResult = await controller.AssignVeilingToProduct(product.id, veilingRequest);
        Assert.IsType<OkResult>(assignVeilingResult);

        var assignKoperRequest = new UpdateProductKoper { koperId = koper.Id };
        var assignKoperResult = await controller.AssignKoperToProduct(product.id, assignKoperRequest);
        Assert.IsType<OkResult>(assignKoperResult);

        // Verify product in DB
        var updatedProduct = context.Product.Single(p => p.ArtikelId == product.id);
        Assert.Equal(veiling.VeilingId, updatedProduct.VeilingId);
        Assert.Equal(koper.Id, updatedProduct.gebruiker_id);
        Assert.Equal(25, updatedProduct.StartPrijs);
        Assert.Equal(0.5m, updatedProduct.IncrementPerSecond);
    }
}