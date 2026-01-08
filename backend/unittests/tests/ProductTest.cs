using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using veilingklok;
using veilingklok.Models;

namespace unittests
{
    public class FakeVeilingContextForProducts
    {
        public List<Product> Product { get; set; } = new List<Product>();
        public List<Koper> Koper { get; set; } = new List<Koper>();
        public List<Aanvoerder> Aanvoerder { get; set; } = new List<Aanvoerder>();
        public List<Veiling> Veiling { get; set; } = new List<Veiling>();

        public Task<int> SaveChangesAsync() => Task.FromResult(1);
    }

    public class ProductsControllerForTest
    {
        private readonly FakeVeilingContextForProducts _db;

        public ProductsControllerForTest(FakeVeilingContextForProducts db)
        {
            _db = db;
        }

        public Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProducts()
        {
            var responses = _db.Product
                .OrderBy(p => p.ArtikelId)
                .Select(p => new ProductResponse
                {
                    id = p.ArtikelId,
                    soort = p.Soort,
                    potmaat = p.Potmaat,
                    steellengte = p.Steellengte,
                    hoeveelheid = p.Hoeveelheid,
                    minimumprijs = p.MinimumPrijs,
                    kloklokatie = p.KlokLocatie,
                    afbeelding = p.Afbeelding,
                    gebruiker_id = p.Gebruiker_id,
                    startprijs = p.StartPrijs,
                    incrementPerSecond = p.IncrementPerSecond
                })
                .ToList();

            return Task.FromResult<ActionResult<IEnumerable<ProductResponse>>>(new OkObjectResult(responses));
        }

        public Task<ActionResult<ProductResponse>> GetProduct(int id)
        {
            var p = _db.Product.SingleOrDefault(prod => prod.ArtikelId == id);
            if (p == null)
                return Task.FromResult<ActionResult<ProductResponse>>(new NotFoundObjectResult($"Product {id} niet gevonden"));

            var response = new ProductResponse
            {
                id = p.ArtikelId,
                soort = p.Soort,
                potmaat = p.Potmaat,
                steellengte = p.Steellengte,
                hoeveelheid = p.Hoeveelheid,
                minimumprijs = p.MinimumPrijs,
                kloklokatie = p.KlokLocatie,
                afbeelding = p.Afbeelding,
                gebruiker_id = p.Gebruiker_id
            };

            return Task.FromResult<ActionResult<ProductResponse>>(new OkObjectResult(response));
        }

        public Task<ActionResult<ProductResponse>> AddProduct(CreateProductRequest req)
        {
            if (req == null || string.IsNullOrEmpty(req.soort))
                return Task.FromResult<ActionResult<ProductResponse>>(new BadRequestObjectResult("Ongeldige productgegevens"));

            if (req.minimumprijs.HasValue && req.minimumprijs < 0)
                return Task.FromResult<ActionResult<ProductResponse>>(new BadRequestObjectResult("MinimumPrijs kan niet negatief zijn"));

            var product = new Product
            {
                ArtikelId = _db.Product.Count > 0 ? _db.Product.Max(p => p.ArtikelId) + 1 : 1,
                Soort = req.soort,
                Potmaat = req.potmaat,
                Steellengte = req.steellengte,
                Hoeveelheid = req.hoeveelheid,
                MinimumPrijs = req.minimumprijs,
                KlokLocatie = req.kloklokatie,
                Afbeelding = req.afbeelding
            };

            _db.Product.Add(product);

            var response = new ProductResponse
            {
                id = product.ArtikelId,
                soort = product.Soort,
                potmaat = product.Potmaat,
                steellengte = product.Steellengte,
                hoeveelheid = product.Hoeveelheid,
                minimumprijs = product.MinimumPrijs,
                kloklokatie = product.KlokLocatie,
                afbeelding = product.Afbeelding,
                startprijs = product.StartPrijs,
                incrementPerSecond = product.IncrementPerSecond
            };

            return Task.FromResult<ActionResult<ProductResponse>>(new OkObjectResult(response));
        }

        public Task<ActionResult> DeleteProduct(int id)
        {
            var p = _db.Product.SingleOrDefault(prod => prod.ArtikelId == id);
            if (p == null)
                return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Product {id} niet gevonden"));

            _db.Product.Remove(p);
            return Task.FromResult<ActionResult>(new OkResult());
        }

        public Task<ActionResult> AssignKoperToProduct(int id, UpdateProductKoper req)
        {
            var p = _db.Product.SingleOrDefault(prod => prod.ArtikelId == id);
            if (p == null)
                return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Product {id} niet gevonden"));

            if (req == null || string.IsNullOrEmpty(req.koperId))
                return Task.FromResult<ActionResult>(new BadRequestObjectResult("Ongeldig koperId"));

            var koper = _db.Koper.SingleOrDefault(k => k.Id == req.koperId);
            if (koper == null)
                return Task.FromResult<ActionResult>(new BadRequestObjectResult($"Koper {req.koperId} niet gevonden"));

            // Let op: in jouw models lijkt zowel Gebruiker_id als gebruiker_id te bestaan.
            // In tests gebruiken we dezelfde als in je branches: gebruiker_id
            p.gebruiker_id = req.koperId;

            return Task.FromResult<ActionResult>(new OkResult());
        }

        public Task<ActionResult> AssignVeilingToProduct(int id, UpdateProductVeiling req)
        {
            var p = _db.Product.SingleOrDefault(prod => prod.ArtikelId == id);
            if (p == null)
                return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Product {id} niet gevonden"));

            if (req == null)
                return Task.FromResult<ActionResult>(new BadRequestObjectResult("Ongeldige request"));

            if (req.veilingId.HasValue)
            {
                // don't allow assigning if product already has a veiling
                if (p.VeilingId.HasValue)
                    return Task.FromResult<ActionResult>(new BadRequestObjectResult("Product is al toegewezen aan een veiling"));

                var veiling = _db.Veiling.SingleOrDefault(v => v.VeilingId == req.veilingId.Value);
                if (veiling == null)
                    return Task.FromResult<ActionResult>(new BadRequestObjectResult($"Veiling {req.veilingId.Value} niet gevonden"));

                p.VeilingId = req.veilingId.Value;

                if (req.startprijs.HasValue)
                    p.StartPrijs = req.startprijs.Value;

                if (req.incrementPerSecond.HasValue)
                    p.IncrementPerSecond = req.incrementPerSecond.Value;
            }
            else
            {
                p.VeilingId = null;
                p.StartPrijs = null;
                p.IncrementPerSecond = null;
            }

            return Task.FromResult<ActionResult>(new OkResult());
        }
    }

    // --- Tests ---
    public class ProductTests
    {
        private FakeVeilingContextForProducts GetContextWithData()
        {
            var ctx = new FakeVeilingContextForProducts();
            ctx.Aanvoerder.Add(new Aanvoerder { Id = "a1" });
            ctx.Koper.Add(new Koper { Id = "k1" });
            ctx.Product.Add(new Product { ArtikelId = 1, Soort = "Plant", Gebruiker_id = "a1" });
            ctx.Veiling.Add(new Veiling { VeilingId = 1 });
            return ctx;
        }

        // Extra test uit "andere branch" (echte controller + EF InMemory)
        [Fact]
        public async Task GetAllProducts_FilterByVeiling_ReturnsOnlyMatching()
        {
            // Gebruik een unieke DB-naam per test-run om flakiness te voorkomen
            var dbName = $"product_filter_test_{Guid.NewGuid()}";

            var options = new DbContextOptionsBuilder<VeilingContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            var ctx = new VeilingContext(options);

            ctx.Veiling.Add(new Veiling
            {
                VeilingId = 1,
                Gebruiker_id = "vm1",
                VeilingNaam = "V1",
                Status = "Ongoing",
                StartTijd = DateTime.UtcNow,
                EindTijd = DateTime.UtcNow.AddHours(1)
            });

            ctx.Veiling.Add(new Veiling
            {
                VeilingId = 2,
                Gebruiker_id = "vm1",
                VeilingNaam = "V2",
                Status = "Ongoing",
                StartTijd = DateTime.UtcNow,
                EindTijd = DateTime.UtcNow.AddHours(1)
            });

            ctx.Product.Add(new Product { ArtikelId = 10, Soort = "A", VeilingId = 1, Gebruiker_id = "a1" });
            ctx.Product.Add(new Product { ArtikelId = 11, Soort = "B", VeilingId = 2, Gebruiker_id = "a1" });
            ctx.Product.Add(new Product { ArtikelId = 12, Soort = "C", VeilingId = null, Gebruiker_id = "a1" });

            await ctx.SaveChangesAsync();

            var mockMgr = new Mock<veilingklok.Services.IAuctionManager>();
            var controller = new veilingklok.ProductsController(ctx, mockMgr.Object);

            var result = await controller.GetAllProducts(1);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var list = Assert.IsType<List<ProductResponse>>(ok.Value);

            Assert.Single(list);
            Assert.Equal(10, list[0].id);
        }

        [Fact]
        public async Task GetAllProducts_ReturnsProducts()
        {
            var controller = new ProductsControllerForTest(GetContextWithData());
            var result = await controller.GetAllProducts();
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var list = Assert.IsType<List<ProductResponse>>(okResult.Value);
            Assert.Single(list);
        }

        [Fact]
        public async Task AddProduct_AddsProduct()
        {
            var ctx = GetContextWithData();
            var controller = new ProductsControllerForTest(ctx);

            var req = new CreateProductRequest
            {
                soort = "Plant",
                minimumprijs = 10
            };

            var result = await controller.AddProduct(req);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ProductResponse>(okResult.Value);

            Assert.Equal("Plant", response.soort);
            Assert.Equal(2, response.id); // auto increment
        }

        [Fact]
        public async Task DeleteProduct_RemovesProduct()
        {
            var ctx = GetContextWithData();
            var controller = new ProductsControllerForTest(ctx);

            var result = await controller.DeleteProduct(1);
            Assert.IsType<OkResult>(result);

            Assert.Empty(ctx.Product);
        }

        [Fact]
        public async Task AssignKoperToProduct_SetsKoper()
        {
            var ctx = GetContextWithData();
            var controller = new ProductsControllerForTest(ctx);

            var req = new UpdateProductKoper { koperId = "k1" };
            await controller.AssignKoperToProduct(1, req);

            Assert.Equal("k1", ctx.Product.Single().gebruiker_id);
        }

        [Fact]
        public async Task AssignVeilingToProduct_SetsVeiling()
        {
            var ctx = GetContextWithData();
            var controller = new ProductsControllerForTest(ctx);

            var req = new UpdateProductVeiling { veilingId = 1 };
            await controller.AssignVeilingToProduct(1, req);

            Assert.Equal(1, ctx.Product.Single().VeilingId);
        }

        [Fact]
        public async Task AssignVeilingToProduct_FailsWhenAlreadyAssigned()
        {
            var ctx = GetContextWithData();
            ctx.Veiling.Add(new Veiling { VeilingId = 2 });

            var controller = new ProductsControllerForTest(ctx);

            var req1 = new UpdateProductVeiling { veilingId = 1 };
            await controller.AssignVeilingToProduct(1, req1);

            var req2 = new UpdateProductVeiling { veilingId = 2 };
            var result = await controller.AssignVeilingToProduct(1, req2);

            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}
