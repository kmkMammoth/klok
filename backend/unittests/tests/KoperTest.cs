using Microsoft.AspNetCore.Mvc;
using veilingklok.Models;

namespace unittests
{
    public class TestVeilingContext
    {
        public List<Koper> Koper { get; set; } = new List<Koper>();

        public Task<int> SaveChangesAsync() => Task.FromResult(1);
    }

    public class KoperControllerForTest
    {
        private readonly TestVeilingContext _db;

        public KoperControllerForTest(TestVeilingContext db)
        {
            _db = db;
        }

        public Task<ActionResult<Koper>> GetUser(string id)
        {
            var koper = _db.Koper.SingleOrDefault(k => k.Id == id);
            return Task.FromResult<ActionResult<Koper>>(koper);
        }

        public Task<ActionResult> AddKoper(string userID, string kvkNumber, string adress, string email, string ibanHash)
        {
            _db.Koper.Add(new Koper { Id = userID, KvkNummer = kvkNumber, Adres = adress, Email = email, IbanHash = ibanHash });
            return Task.FromResult<ActionResult>(new OkResult());
        }

        public Task<ActionResult> ChangeKoper(string koperID, string userID, string kvkNumber, string adress, string email, string ibanHash)
        {
            var koper = _db.Koper.Single(k => k.Id == koperID);
            koper.KvkNummer = kvkNumber;
            koper.Adres = adress;
            koper.Email = email;
            koper.IbanHash = ibanHash;
            return Task.FromResult<ActionResult>(new OkResult());
        }

        public Task<ActionResult> DeleteUser(string koperID)
        {
            var koper = _db.Koper.SingleOrDefault(k => k.Id == koperID);
            if (koper != null) _db.Koper.Remove(koper);
            return Task.FromResult<ActionResult>(new OkResult());
        }
    }

    // --- Tests ---
    public class KoperTests
    {
        private TestVeilingContext GetContextWithData()
        {
            var ctx = new TestVeilingContext();
            ctx.Koper.Add(new Koper { Id = "user1", KvkNummer = "123", Adres = "Adres1", Email = "email1@example.com", IbanHash = "hash1" });
            ctx.Koper.Add(new Koper { Id = "user2", KvkNummer = "456", Adres = "Adres2", Email = "email2@example.com", IbanHash = "hash2" });
            return ctx;
        }

        [Fact]
        public async Task GetUser_ReturnsCorrectKoper()
        {
            var controller = new KoperControllerForTest(GetContextWithData());
            var result = await controller.GetUser("user1");
            var koper = Assert.IsType<Koper>(result.Value);
            Assert.Equal("user1", koper.Id);
            Assert.Equal("123", koper.KvkNummer);
        }

        [Fact]
        public async Task AddKoper_AddsNewKoper()
        {
            var ctx = new TestVeilingContext();
            var controller = new KoperControllerForTest(ctx);

            await controller.AddKoper("user3", "789", "Adres3", "email3@example.com", "hash3");

            Assert.Single(ctx.Koper);
            Assert.Equal("user3", ctx.Koper[0].Id);
        }

        [Fact]
        public async Task ChangeKoper_UpdatesKoper()
        {
            var ctx = GetContextWithData();
            var controller = new KoperControllerForTest(ctx);

            await controller.ChangeKoper("user1", "user1", "999", "NieuwAdres", "nieuw@example.com", "newhash");

            var koper = ctx.Koper.Single(k => k.Id == "user1");
            Assert.Equal("999", koper.KvkNummer);
            Assert.Equal("NieuwAdres", koper.Adres);
        }

        [Fact]
        public async Task DeleteUser_RemovesKoper()
        {
            var ctx = GetContextWithData();
            var controller = new KoperControllerForTest(ctx);

            await controller.DeleteUser("user1");

            Assert.Single(ctx.Koper);
            Assert.DoesNotContain(ctx.Koper, k => k.Id == "user1");
        }
    }
}
