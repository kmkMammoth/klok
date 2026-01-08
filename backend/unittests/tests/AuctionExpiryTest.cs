using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using veilingklok;
using veilingklok.Hubs;
using veilingklok.Models;
using veilingklok.Services;

namespace unittests
{
    public class AuctionExpiryTest
    {
        private IHubContext<AuctionHub> CreateMockHub()
        {
            var mockClients = new Mock<IHubClients>();
            var mockGroup = new Mock<IClientProxy>();
            mockClients.Setup(c => c.Group(It.IsAny<string>())).Returns(mockGroup.Object);

            var mockHub = new Mock<IHubContext<AuctionHub>>();
            mockHub.Setup(h => h.Clients).Returns(mockClients.Object);
            return mockHub.Object;
        }

        [Fact]
        public async Task Product_Expires_When_Minimum_Reached_Then_Starts_Next()
        {
            var services = new ServiceCollection();
            var root = new Microsoft.EntityFrameworkCore.Storage.InMemoryDatabaseRoot();
            services.AddDbContext<VeilingContext>(opt => opt.UseInMemoryDatabase("expiry_test_1", root).EnableSensitiveDataLogging());
            services.AddSingleton(CreateMockHub());
            services.AddScoped<IAuctionManager, AuctionManager>();

            var provider = services.BuildServiceProvider();

            // Seed data using direct context (bypass DI) to isolate InMemory behavior
            var opts = new DbContextOptionsBuilder<VeilingContext>().UseInMemoryDatabase("expiry_test_1", root).EnableSensitiveDataLogging().EnableDetailedErrors().Options;
            using (var ctx = new VeilingContext(opts))
            {
                var v = new Veiling { VeilingId = 1, Gebruiker_id = "vm1", VeilingNaam = "Expiry Test", Status = "Ongoing", StartTijd = DateTime.UtcNow.AddMinutes(-1), EindTijd = DateTime.UtcNow.AddMinutes(10) };
                System.Console.WriteLine($"Seeding Veiling: Gebruiker_id={v.Gebruiker_id}, VeilingNaam={v.VeilingNaam}, Status={v.Status}");
                ctx.Veiling.Add(v);
                // Inspect entries before Save
                foreach (var entry in ctx.ChangeTracker.Entries())
                {
                    var t = entry.Entity.GetType();
                    System.Console.WriteLine($"BeforeSave Entry Type: {t.FullName} State: {entry.State}");
                    foreach (var prop in entry.Properties)
                    {
                        System.Console.WriteLine($"  {prop.Metadata.Name}: {prop.CurrentValue ?? "<null>"}");
                    }
                }
                try
                {
                    await ctx.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    System.Console.WriteLine("Save failed: " + ex.Message);
                    foreach (var entry in ctx.ChangeTracker.Entries())
                    {
                        var t = entry.Entity.GetType();
                        System.Console.WriteLine($"Entry Type: {t.FullName} State: {entry.State}");
                        foreach (var prop in entry.Properties)
                        {
                            System.Console.WriteLine($"  {prop.Metadata.Name}: {prop.CurrentValue ?? "<null>"}");
                        }
                    }
                    throw;
                }
                // Product 1 will reach minimum quickly (start 100, min 0, increment 100 => 1s)
                ctx.Product.Add(new Product { ArtikelId = 1, Soort = "TestPlant", Gebruiker_id = "a1", StartPrijs = 100m, IncrementPerSecond = 100m, MinimumPrijs = 0m, Status = "PENDING", VeilingId = 1 });
                ctx.Product.Add(new Product { ArtikelId = 2, Soort = "TestPlant", Gebruiker_id = "a1", StartPrijs = 100m, IncrementPerSecond = 0m, MinimumPrijs = 50m, Status = "PENDING", VeilingId = 1 });

                // Inspect entries before saving products
                foreach (var entry in ctx.ChangeTracker.Entries())
                {
                    var t = entry.Entity.GetType();
                    System.Console.WriteLine($"BeforeProductSave Entry Type: {t.FullName} State: {entry.State}");
                    foreach (var prop in entry.Properties)
                    {
                        System.Console.WriteLine($"  {prop.Metadata.Name}: {prop.CurrentValue ?? "<null>"}");
                    }
                }

                await ctx.SaveChangesAsync();
            }

            using (var scope = provider.CreateScope())
            {
                var mgr = scope.ServiceProvider.GetRequiredService<IAuctionManager>();
                await mgr.StartNextProductAsync(1);
            }

            // Wait enough time for expiry to trigger (1s + buffer)
            await Task.Delay(1600);

            using (var scope = provider.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<VeilingContext>();
                var p1 = await ctx.Product.FindAsync(1);
                var p2 = await ctx.Product.FindAsync(2);

                if (p1 == null || p2 == null)
                {
                    System.Console.WriteLine("Products in DB after waiting:");
                    foreach (var prod in ctx.Product.ToList())
                    {
                        System.Console.WriteLine($" Product {prod.ArtikelId}: Soort={prod.Soort} Gebruiker_id={prod.Gebruiker_id} Status={prod.Status} VeilingId={prod.VeilingId} StartedAtUtc={prod.StartedAtUtc}");
                    }
                }

                Assert.NotNull(p1);
                Assert.NotNull(p2);
                Assert.Equal("VERWORPEN", p1.Status);
                Assert.Equal("RUNNING", p2.Status);
            }
        }
    }
}
