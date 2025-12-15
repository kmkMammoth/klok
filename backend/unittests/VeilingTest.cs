using Microsoft.AspNetCore.Mvc;
using veilingklok;
using veilingklok.Models;

namespace unittests
{
    public class FakeVeilingContextForAuctions
    {
        public List<Veiling> Veiling { get; set; } = new List<Veiling>();
        public List<Veilingmeester> Veilingmeester { get; set; } = new List<Veilingmeester>();

        public Task<int> SaveChangesAsync() => Task.FromResult(1);
    }

    public class AuctionsControllerForTest
    {
        private readonly FakeVeilingContextForAuctions _db;

        public AuctionsControllerForTest(FakeVeilingContextForAuctions db)
        {
            _db = db;
        }

        public Task<ActionResult<IEnumerable<AuctionResponse>>> GetAllAuctions()
        {
            var responses = _db.Veiling
                .OrderBy(v => v.VeilingId)
                .Select(v => new AuctionResponse
                {
                    id = v.VeilingId,
                    name = v.VeilingNaam,
                    maxTime = (int)(v.EindTijd - v.StartTijd).TotalSeconds,
                    startingPrice = v.MinimumPrijs ?? 0,
                    status = v.Status,
                    startTime = new DateTimeOffset(v.StartTijd).ToUnixTimeMilliseconds(),
                    endTime = new DateTimeOffset(v.EindTijd).ToUnixTimeMilliseconds()
                })
                .ToList();

            return Task.FromResult<ActionResult<IEnumerable<AuctionResponse>>>(new OkObjectResult(responses));
        }

        public Task<ActionResult<AuctionResponse>> GetAuction(int id)
        {
            var v = _db.Veiling.FirstOrDefault(x => x.VeilingId == id);
            if (v == null) return Task.FromResult<ActionResult<AuctionResponse>>(new NotFoundObjectResult($"Veiling {id} niet gevonden"));

            var response = new AuctionResponse
            {
                id = v.VeilingId,
                name = v.VeilingNaam,
                maxTime = (int)(v.EindTijd - v.StartTijd).TotalSeconds,
                startingPrice = v.MinimumPrijs ?? 0,
                status = v.Status,
                startTime = new DateTimeOffset(v.StartTijd).ToUnixTimeMilliseconds(),
                endTime = new DateTimeOffset(v.EindTijd).ToUnixTimeMilliseconds()
            };

            return Task.FromResult<ActionResult<AuctionResponse>>(new OkObjectResult(response));
        }

        public Task<ActionResult<AuctionResponse>> AddAuction(CreateAuctionRequest req)
        {
            if (req == null || string.IsNullOrEmpty(req.name) || req.maxTime <= 0 || req.startingPrice < 0)
                return Task.FromResult<ActionResult<AuctionResponse>>(new BadRequestObjectResult("Ongeldige veilinggegevens"));

            // validate veilingmeester exists in fake context
            if (string.IsNullOrEmpty(req.veilingmeesterId) || !_db.Veilingmeester.Any(vm => vm.Id == req.veilingmeesterId))
                return Task.FromResult<ActionResult<AuctionResponse>>(new BadRequestObjectResult($"Veilingmeester met ID {req.veilingmeesterId} niet gevonden"));

            var veiling = new Veiling
            {
                VeilingId = _db.Veiling.Count > 0 ? _db.Veiling.Max(v => v.VeilingId) + 1 : 1,
                VeilingNaam = req.name,
                MinimumPrijs = req.startingPrice,
                Status = "Idle",
                StartTijd = DateTime.Now,
                EindTijd = DateTime.Now.AddSeconds(req.maxTime),
                Gebruiker_id = "1"
            };

            // set the provided veilingmeester id
            veiling.Gebruiker_id = req.veilingmeesterId;

            _db.Veiling.Add(veiling);

            var response = new AuctionResponse
            {
                id = veiling.VeilingId,
                name = veiling.VeilingNaam,
                maxTime = (int)(veiling.EindTijd - veiling.StartTijd).TotalSeconds,
                startingPrice = veiling.MinimumPrijs ?? 0,
                status = veiling.Status,
                startTime = new DateTimeOffset(veiling.StartTijd).ToUnixTimeMilliseconds(),
                endTime = new DateTimeOffset(veiling.EindTijd).ToUnixTimeMilliseconds()
            };

            return Task.FromResult<ActionResult<AuctionResponse>>(new OkObjectResult(response));
        }

        public Task<ActionResult> UpdateAuction(int id, string status)
        {
            var v = _db.Veiling.FirstOrDefault(x => x.VeilingId == id);
            if (v == null) return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Veiling {id} niet gevonden"));

            v.Status = status;
            return Task.FromResult<ActionResult>(new OkResult());
        }

        public Task<ActionResult> DeleteAuction(int id)
        {
            var v = _db.Veiling.FirstOrDefault(x => x.VeilingId == id);
            if (v == null) return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Veiling {id} niet gevonden"));

            _db.Veiling.Remove(v);
            return Task.FromResult<ActionResult>(new OkResult());
        }
    }

    // --- Tests ---
    public class AuctionsControllerTests
    {
        private FakeVeilingContextForAuctions GetContextWithData()
        {
            var ctx = new FakeVeilingContextForAuctions();
            // include a veilingmeester in the fake context so fk-constraints can be simulated
            ctx.Veilingmeester.Add(new Veilingmeester { Id = "vm1" });
            ctx.Veiling.Add(new Veiling
            {
                VeilingId = 1,
                VeilingNaam = "TestVeiling",
                StartTijd = DateTime.Now,
                EindTijd = DateTime.Now.AddMinutes(10),
                MinimumPrijs = 100,
                Status = "Idle"
            });
            return ctx;
        }

        [Fact]
        public async Task GetAllAuctions_ReturnsVeilingen()
        {
            var controller = new AuctionsControllerForTest(GetContextWithData());
            var result = await controller.GetAllAuctions();
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var list = Assert.IsType<List<AuctionResponse>>(okResult.Value);
            Assert.Single(list);
        }

        [Fact]
        public async Task AddAuction_CreatesAuction()
        {
            var ctx = new FakeVeilingContextForAuctions();
            // add a veilingmeester so the controller can validate the provided id
            ctx.Veilingmeester.Add(new Veilingmeester { Id = "vm1" });
            var controller = new AuctionsControllerForTest(ctx);

            var req = new CreateAuctionRequest
            {
                name = "NieuweVeiling",
                maxTime = 300,
                startingPrice = 50,
                veilingmeesterId = "vm1"
            };

            var result = await controller.AddAuction(req);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<AuctionResponse>(okResult.Value);

            Assert.Equal("NieuweVeiling", response.name);
            Assert.Equal(1, response.id);
            Assert.Equal("Idle", response.status);
        }

        [Fact]
        public async Task UpdateAuction_ChangesStatus()
        {
            var ctx = GetContextWithData();
            var controller = new AuctionsControllerForTest(ctx);

            await controller.UpdateAuction(1, "Running");

            Assert.Equal("Running", ctx.Veiling.Single().Status);
        }

        [Fact]
        public async Task DeleteAuction_RemovesVeiling()
        {
            var ctx = GetContextWithData();
            var controller = new AuctionsControllerForTest(ctx);

            // call delete and assert the veiling is removed
            await controller.DeleteAuction(1);

            Assert.DoesNotContain(ctx.Veiling, v => v.VeilingId == 1);
        }

        [Fact]
        public async Task GetAuction_ReturnsCorrectAuction()
        {
            var ctx = GetContextWithData();
            var controller = new AuctionsControllerForTest(ctx);

            var result = await controller.GetAuction(1);
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<AuctionResponse>(okResult.Value);

            Assert.Equal("TestVeiling", response.name);
            Assert.Equal(1, response.id);
        }
    }
}
