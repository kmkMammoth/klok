using Microsoft.AspNetCore.Mvc;
using veilingklok.Models;

namespace unittests
{
    public class FakeVeilingContextForUsers
    {
        public List<Gebruiker> Gebruiker { get; set; } = new List<Gebruiker>();

        public Task<int> SaveChangesAsync() => Task.FromResult(1);
    }

    public class UserManagementControllerForTest
    {
        private readonly FakeVeilingContextForUsers _db;

        public UserManagementControllerForTest(FakeVeilingContextForUsers db)
        {
            _db = db;
        }

        public Task<ActionResult<IEnumerable<Gebruiker>>> GetUser(string id)
        {
            var users = _db.Gebruiker.Where(u => u.Id == id).ToList();
            return Task.FromResult<ActionResult<IEnumerable<Gebruiker>>>(new OkObjectResult(users));
        }

        public Task<ActionResult> AddUser(string name)
        {
            var newUser = new Gebruiker
            {
                Id = _db.Gebruiker.Count > 0 ? (_db.Gebruiker.Max(u => int.Parse(u.Id)) + 1).ToString() : "1",
                Naam = name
            };
            _db.Gebruiker.Add(newUser);
            return Task.FromResult<ActionResult>(new OkResult());
        }

        public Task<ActionResult> ChangeUser(string id, string name)
        {
            var user = _db.Gebruiker.SingleOrDefault(u => u.Id == id);
            if (user == null) return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Gebruiker {id} niet gevonden"));

            user.Naam = name;
            return Task.FromResult<ActionResult>(new OkResult());
        }

        public Task<ActionResult> DeleteUser(string id)
        {
            var user = _db.Gebruiker.SingleOrDefault(u => u.Id == id);
            if (user == null) return Task.FromResult<ActionResult>(new NotFoundObjectResult($"Gebruiker {id} niet gevonden"));

            _db.Gebruiker.Remove(user);
            return Task.FromResult<ActionResult>(new OkResult());
        }
    }

    // --- Tests ---
    public class UserManagementControllerTests
    {
        private FakeVeilingContextForUsers GetContextWithData()
        {
            var ctx = new FakeVeilingContextForUsers();
            ctx.Gebruiker.Add(new Gebruiker { Id = "1", Naam = "Alice" });
            ctx.Gebruiker.Add(new Gebruiker { Id = "2", Naam = "Bob" });
            return ctx;
        }

        [Fact]
        public async Task GetUser_ReturnsCorrectUser()
        {
            var controller = new UserManagementControllerForTest(GetContextWithData());

            var result = await controller.GetUser("1");
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var users = Assert.IsType<List<Gebruiker>>(okResult.Value);

            Assert.Single(users);
            Assert.Equal("Alice", users[0].Naam);
        }

        [Fact]
        public async Task AddUser_AddsNewUser()
        {
            var ctx = new FakeVeilingContextForUsers();
            var controller = new UserManagementControllerForTest(ctx);

            await controller.AddUser("Charlie");

            Assert.Single(ctx.Gebruiker);
            Assert.Equal("Charlie", ctx.Gebruiker[0].Naam);
            Assert.Equal("1", ctx.Gebruiker[0].Id);
        }

        [Fact]
        public async Task ChangeUser_UpdatesUserName()
        {
            var ctx = GetContextWithData();
            var controller = new UserManagementControllerForTest(ctx);

            await controller.ChangeUser("1", "AliceUpdated");

            var user = ctx.Gebruiker.Single(u => u.Id == "1");
            Assert.Equal("AliceUpdated", user.Naam);
        }

        [Fact]
        public async Task DeleteUser_RemovesUser()
        {
            var ctx = GetContextWithData();
            var controller = new UserManagementControllerForTest(ctx);

            await controller.DeleteUser("1");

            Assert.Single(ctx.Gebruiker);
            Assert.DoesNotContain(ctx.Gebruiker, u => u.Id == "1");
        }
    }
}
