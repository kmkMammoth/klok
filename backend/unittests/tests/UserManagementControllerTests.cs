using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using veilingklok;
using veilingklok.Models;
using Xunit;

namespace unittests
{
    public class UserManagementControllerTests : IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly DbContextOptions<VeilingContext> _contextOptions;
        private readonly Mock<UserManager<Gebruiker>> _userManagerMock;

        public UserManagementControllerTests()
        {
            // SQLite in-memory database
            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();

            _contextOptions = new DbContextOptionsBuilder<VeilingContext>()
                .UseSqlite(_connection)
                .Options;

            using var context = new VeilingContext(_contextOptions);
            context.Database.EnsureCreated();

            // Seed gebruiker
            context.Gebruiker.Add(new Gebruiker
            {
                Id = "u1",
                Naam = "TestGebruiker"
            });

            context.SaveChanges();

            // Mock UserManager
            var store = new Mock<IUserStore<Gebruiker>>();
            _userManagerMock = new Mock<UserManager<Gebruiker>>(
                store.Object, null, null, null, null, null, null, null, null
            );
        }

        private UserManagementController CreateController(ClaimsPrincipal? user = null)
        {
            var context = new VeilingContext(_contextOptions);
            var controller = new UserManagementController(context, _userManagerMock.Object);

            if (user != null)
            {
                controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = user
                    }
                };
            }

            return controller;
        }

        [Fact]
        public async Task GetUserRole_UserExists_ReturnsRoles()
        {
            // Arrange
            var testUser = new Gebruiker { Id = "u1", Naam = "TestGebruiker" };

            var claimsUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "u1")
            }, "mock"));

            _userManagerMock
                .Setup(m => m.GetUserAsync(claimsUser))
                .ReturnsAsync(testUser);

            _userManagerMock
                .Setup(m => m.GetRolesAsync(testUser))
                .ReturnsAsync(new List<string> { "Admin", "Koper" });

            var controller = CreateController(claimsUser);

            // Act
            var result = await controller.GetUserRole();

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var roles = Assert.IsAssignableFrom<IList<string>>(ok.Value);
            Assert.Contains("Admin", roles);
            Assert.Contains("Koper", roles);
        }

        [Fact]
        public async Task GetLoggedInUserId_UserExists_ReturnsId()
        {
            var testUser = new Gebruiker { Id = "u1", Naam = "TestGebruiker" };

            var claimsUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "u1")
            }, "mock"));

            _userManagerMock.Setup(m => m.GetUserAsync(claimsUser))
                .ReturnsAsync(testUser);

            var controller = CreateController(claimsUser);

            var result = await controller.GetLoggedInUserId();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal("u1", ok.Value);
        }

        [Fact]
        public async Task GetUser_UserExists_ReturnsUser()
        {
            var testUser = new Gebruiker { Id = "u1", Naam = "TestGebruiker" };

            var claimsUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "u1")
            }, "mock"));

            _userManagerMock.Setup(m => m.GetUserAsync(claimsUser))
                .ReturnsAsync(testUser);

            var controller = CreateController(claimsUser);

            var result = await controller.GetUser();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var user = Assert.IsType<Gebruiker>(ok.Value);
            Assert.Equal("TestGebruiker", user.Naam);
        }

        [Fact]
        public async Task AddUser_ValidName_AddsUser()
        {
            var controller = CreateController();

            var result = await controller.AddUser("NieuweGebruiker");

            Assert.IsType<OkResult>(result);

            using var context = new VeilingContext(_contextOptions);
            Assert.Equal(2, context.Gebruiker.Count());
        }

        [Fact]
        public async Task ChangeUser_ExistingUser_UpdatesName()
        {
            var controller = CreateController();

            var result = await controller.ChangeUser("u1", "GewijzigdeNaam");

            Assert.IsType<OkResult>(result);

            using var context = new VeilingContext(_contextOptions);
            var user = context.Gebruiker.Single(u => u.Id == "u1");
            Assert.Equal("GewijzigdeNaam", user.Naam);
        }

        [Fact]
        public async Task DeleteUser_ExistingUser_RemovesUser()
        {
            var controller = CreateController();

            var result = await controller.DeleteUser("u1");

            Assert.IsType<OkResult>(result);

            using var context = new VeilingContext(_contextOptions);
            Assert.Empty(context.Gebruiker);
        }

        public void Dispose()
        {
            _connection.Close();
            _connection.Dispose();
        }
    }
}
