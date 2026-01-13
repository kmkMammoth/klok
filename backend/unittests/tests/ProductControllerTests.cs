using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using veilingklok;
using veilingklok.Models;
using veilingklok.Services;
using Xunit;

namespace unittests;
    public class ProductsControllerTests : IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly DbContextOptions<VeilingContext> _contextOptions;
        private readonly Mock<IAuctionManager> _auctionManagerMock;

        public ProductsControllerTests()
        {
            // SQLite in-memory database
            _auctionManagerMock = new Mock<IAuctionManager>();
            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();

            _contextOptions = new DbContextOptionsBuilder<VeilingContext>()
                .UseSqlite(_connection)
                .Options;

            using var context = new VeilingContext(_contextOptions);
            context.Database.EnsureCreated();

            // Seed Aanvoerder (full required fields)
            context.Aanvoerder.Add(new Aanvoerder
            {
                Id = "a1",
                Naam = "TestAanvoerder",
                KvkNummer = "12345678",
                Adres = "TestAdres",
                Email = "test@test.test",
                IbanHash = "NL00 INGB 012345678"
            });

            // Seed Koper (full required fields)
            context.Koper.Add(new Koper
            {
                Id = "k1",
                Naam = "TestKoper",
                KvkNummer = "87654321",
                Adres = "KoperAdres",
                Email = "koper@test.test",
                IbanHash = "NL00 RABO 87654321"
            });

            // Seed Veiling
            context.Veiling.Add(new Veiling
            {
                VeilingId = 1,
                VeilingNaam = "TestVeiling",
                Status = "Ongoing",
                StartTijd = DateTime.Now.AddSeconds(-10),
                EindTijd = DateTime.Now.AddSeconds(50),
                Gebruiker_id = "v1"
            });

            // Seed Veilingmeester required by FK on Veiling.Gebruiker_id
            context.Veilingmeester.Add(new Veilingmeester
            {
                Id = "v1",
                Naam = "TestVeilingmeester"
            });

            context.SaveChanges();
        }
        private VeilingContext CreateContext() => new VeilingContext(_contextOptions);

        private ProductsController CreateController(string? userId = null)
        {
            var context = new VeilingContext(_contextOptions);
            var controller = new ProductsController(context, _auctionManagerMock.Object);

            if (!string.IsNullOrEmpty(userId))
            {
                var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
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
        public async Task AddProduct_ValidRequest_ReturnsOk()
        {
            var controller = CreateController("a1");

            var request = new CreateProductRequest
            {
                soort = "Roos",
                potmaat = 5,
                steellengte = 30,
                hoeveelheid = 10,
                minimumprijs = 15,
                kloklokatie = "TestLocatie",
                afbeelding = "img.jpg"
            };

            var result = await controller.AddProduct(request);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var product = Assert.IsType<ProductResponse>(ok.Value);

            Assert.Equal("Roos", product.soort);

            using var context = new VeilingContext(_contextOptions);
            Assert.Single(context.Product);
        }

        [Fact]
        public async Task GetAllProducts_ReturnsAllProducts()
        {
            var context = new VeilingContext(_contextOptions);
            context.Product.Add(new Product
            {
                ArtikelId = 1,
                Soort = "Roos",
                Gebruiker_id = "a1"
            });
            context.SaveChanges();

            var controller = CreateController("a1");

            var result = await controller.GetAllProducts(null);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var products = Assert.IsAssignableFrom<List<ProductResponse>>(ok.Value);

            Assert.Single(products);
            Assert.Equal("Roos", products[0].soort);
        }

        [Fact]
        public async Task GetProduct_Existing_ReturnsOk()
        {
            var context = new VeilingContext(_contextOptions);
            context.Product.Add(new Product { ArtikelId = 1, Soort = "Tulp", Gebruiker_id = "a1" });
            context.SaveChanges();

            var controller = CreateController("a1");

            var result = await controller.GetProduct(1);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var product = Assert.IsType<ProductResponse>(ok.Value);

            Assert.Equal("Tulp", product.soort);
        }

        [Fact]
        public async Task GetProduct_NotExisting_ReturnsNotFound()
        {
            var controller = CreateController("a1");
            var result = await controller.GetProduct(999);
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task AssignKoperToProduct_Valid_ReturnsOk()
        {
            var context = new VeilingContext(_contextOptions);
            context.Product.Add(new Product { ArtikelId = 1, Soort = "Roos", Gebruiker_id = "a1" });
            context.SaveChanges();

            var controller = CreateController("k1");
            var result = await controller.AssignKoperToProduct(1, new UpdateProductKoper { koperId = "k1" });

            Assert.IsType<OkResult>(result);

            using var checkContext = new VeilingContext(_contextOptions);
            var product = checkContext.Product.Find(1);
            Assert.Equal("k1", product!.gebruiker_id);
            Assert.Equal("GEKOCHT", product.Status);
        }

        [Fact]
        public async Task BuyProduct_Valid_ReturnsOk()
        {
            var context = new VeilingContext(_contextOptions);
            context.Product.Add(new Product { ArtikelId = 1, Soort = "Roos", VeilingId = 1, Gebruiker_id = "a1" });
            context.SaveChanges();

            _auctionManagerMock.Setup(m => m.TryBuyProductAsync(1, "k1", It.IsAny<int>(), It.IsAny<decimal?>())).ReturnsAsync(true);

            var controller = CreateController("k1");
            var result = await controller.BuyProduct(1);

            // Direct cast naar OkObjectResult
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("succesvol gekocht", ok.Value!.ToString());
        }

        [Fact]
        public async Task DeleteProduct_Existing_ReturnsOk()
        {
            var context = new VeilingContext(_contextOptions);
            context.Product.Add(new Product { ArtikelId = 1, Soort = "Roos", Gebruiker_id = "a1" });
            context.SaveChanges();

            var controller = CreateController("a1");
            var result = await controller.DeleteProduct(1);

            Assert.IsType<OkResult>(result);

            using var checkContext = new VeilingContext(_contextOptions);
            Assert.Empty(checkContext.Product);
        }

        public void Dispose()
        {
            _connection.Close();
            _connection.Dispose();
        }
    }
