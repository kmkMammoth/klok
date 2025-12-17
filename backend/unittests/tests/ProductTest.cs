using Microsoft.AspNetCore.Mvc;
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
            if (p == null) return Task.FromResult<ActionResult<ProductResponse>>(new NotFoundObjectResult($"Product {id} niet gevonden"));

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
            if (req == null || string.IsNullOrEmpty(req.soort) || string.IsNullOrEmpty(req.gebruikerId))
                return Task.FromResult<ActionResult<ProductResponse>>(new BadRequestObjectResult("Ongeldige productgegevens"));

            if (req.minimumprijs.HasValue && req.minimumprijs < 0)
                return Task.FromResult<ActionResult<ProductResponse>>(new BadRequestObjectResult("MinimumPrijs kan niet negatief zijn"));

            var aanvoerder = _db.Aanvoerder.SingleOrDefault(a => a.Id == req.gebruikerId);
            if (aanvoerder == null)
                return Task.FromResult<ActionResult<ProductResponse>>(new BadRequestObjectResult($"Aanvoerder {req.gebruikerId} niet gevonden"));

            var product = new Product
            {
                ArtikelId = _db.Product.Count > 0 ? _db.Product.Max(p => p.ArtikelId) + 1 : 1,
                Gebruiker_id = req.gebruikerId,
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
                gebruiker_id = product.Gebruiker_id,
                startprijs = product.StartPrijs,
                incrementPerSecond = product.IncrementPerSecond
            };

            return Task.FromResult<ActionResult<ProductResponse>>(new OkObjectResult(response));
        }

        public Task<ActionResult> DeleteProduct(int id)
        {
            var p = _db.Product.SingleOrDefault(prod => prod.ArtikelId == id);
            if (p == null) return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Product {id} niet gevonden"));

            _db.Product.Remove(p);
            return Task.FromResult<ActionResult>(new OkResult());
        }

        public Task<ActionResult> AssignKoperToProduct(int id, UpdateProductKoper req)
        {
            var p = _db.Product.SingleOrDefault(prod => prod.ArtikelId == id);
            if (p == null) return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Product {id} niet gevonden"));

            if (req == null || string.IsNullOrEmpty(req.koperId)) return Task.FromResult<ActionResult>(new BadRequestObjectResult("Ongeldig koperId"));

            var koper = _db.Koper.SingleOrDefault(k => k.Id == req.koperId);
            if (koper == null) return Task.FromResult<ActionResult>(new BadRequestObjectResult($"Koper {req.koperId} niet gevonden"));

            p.gebruiker_id = req.koperId;
            return Task.FromResult<ActionResult>(new OkResult());
        }

        public Task<ActionResult> AssignVeilingToProduct(int id, UpdateProductVeiling req)
        {
            var p = _db.Product.SingleOrDefault(prod => prod.ArtikelId == id);
            if (p == null) return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Product {id} niet gevonden"));

            if (req == null) return Task.FromResult<ActionResult>(new BadRequestObjectResult("Ongeldige request"));

            if (req.veilingId.HasValue)
            {
                var veiling = _db.Veiling.SingleOrDefault(v => v.VeilingId == req.veilingId.Value);
                if (veiling == null) return Task.FromResult<ActionResult>(new BadRequestObjectResult($"Veiling {req.veilingId.Value} niet gevonden"));
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
    public class ProductsControllerTests
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
                gebruikerId = "a1",
                minimumprijs = 10
            };

            var result = await controller.AddProduct(req);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ProductResponse>(okResult.Value);

            Assert.Equal("Plant", response.soort);
            Assert.Equal("a1", response.gebruiker_id);
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
    }
}
