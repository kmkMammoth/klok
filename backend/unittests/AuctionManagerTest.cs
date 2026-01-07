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
    public class AuctionManagerTests
    {
        private VeilingContext CreateContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<VeilingContext>()
                .UseInMemoryDatabase(dbName)
                .EnableSensitiveDataLogging()
                .EnableDetailedErrors()
                .Options;
            var ctx = new VeilingContext(options);
            return ctx;
        }

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
        public async Task TryBuyProduct_SucceedsAndSetsKoopPrijs()
        {
            var ctx = CreateContext("buy_test_1");
            ctx.Veiling.Add(new Veiling { VeilingId = 1, Gebruiker_id = "vm1", VeilingNaam = "Test Veiling", Status = "Ongoing", StartTijd = DateTime.UtcNow.AddMinutes(-1), EindTijd = DateTime.UtcNow.AddMinutes(10) });
            await ctx.SaveChangesAsync();
            ctx.Product.Add(new Product { ArtikelId = 1, Soort = "TestPlant", Gebruiker_id = "a1", StartPrijs = 100m, IncrementPerSecond = 0m, MinimumPrijs = 50m, StartedAtUtc = DateTime.UtcNow.AddSeconds(-2), Status = "RUNNING", VeilingId = 1 });
            await ctx.SaveChangesAsync();

            var hub = CreateMockHub();
            var scopeFactoryMock = new Mock<IServiceScopeFactory>();
            var scopeMock = new Mock<IServiceScope>();
            var spMock = new Mock<IServiceProvider>();
            spMock.Setup(s => s.GetService(typeof(VeilingContext))).Returns(ctx);
            spMock.Setup(s => s.GetService(typeof(IHubContext<AuctionHub>))).Returns(hub);
            scopeMock.Setup(s => s.ServiceProvider).Returns(spMock.Object);
            scopeFactoryMock.Setup(f => f.CreateScope()).Returns(scopeMock.Object);
            var mgr = new AuctionManager(ctx, hub, scopeFactoryMock.Object);

            try
            {
                var success = await mgr.TryBuyProductAsync(1, "buyer1");
                Assert.True(success);
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"Exception during TryBuyProduct: {ex.GetType().FullName} {ex.Message}");
                DumpEntries(ctx, "AfterTryBuy failure context");
                throw;
            }

            var p = await ctx.Product.FindAsync(1);
            Assert.Equal("buyer1", p.gebruiker_id);
            Assert.Equal("GEKOCHT", p.Status);
            Assert.NotNull(p.KoopPrijs);
            Assert.InRange(p.KoopPrijs.Value, 50m, 100m);
        }

        private void DumpEntries(VeilingContext ctx, string label)
        {
            System.Console.WriteLine($"Dumping ChangeTracker entries for: {label}");
            foreach (var entry in ctx.ChangeTracker.Entries())
            {
                var t = entry.Entity.GetType();
                System.Console.WriteLine($" Entry Type: {t.FullName} State: {entry.State}");
                foreach (var prop in entry.Properties)
                {
                    System.Console.WriteLine($"  {prop.Metadata.Name}: {prop.CurrentValue ?? "<null>"}");
                }

                // If Product, print RowVersion length and bytes if available
                if (entry.Entity is Product p)
                {
                    System.Console.WriteLine($"   Product RowVersion Length: {(p.RowVersion != null ? p.RowVersion.Length.ToString() : "<null>")}");
                }
            }
        }

        [Fact]
        public async Task TryBuyProduct_ConcurrentAtMostOneSucceeds()
        {
            // Use same in-memory DB name to share state between contexts
            var dbName = "buy_test_concurrent";

            var ctxSeed = CreateContext(dbName);
            ctxSeed.Veiling.Add(new Veiling { VeilingId = 1, Gebruiker_id = "vm1", VeilingNaam = "Test Veiling", Status = "Ongoing", StartTijd = DateTime.UtcNow.AddMinutes(-1), EindTijd = DateTime.UtcNow.AddMinutes(10) });
            ctxSeed.Product.Add(new Product { ArtikelId = 1, Soort = "TestPlant", Gebruiker_id = "a1", StartPrijs = 100m, IncrementPerSecond = 0m, MinimumPrijs = 50m, StartedAtUtc = DateTime.UtcNow.AddSeconds(-2), Status = "RUNNING", VeilingId = 1 });

            // Inspect entries before saving seed
            foreach (var entry in ctxSeed.ChangeTracker.Entries())
            {
                var t = entry.Entity.GetType();
                System.Console.WriteLine($"Seed BeforeSave Entry Type: {t.FullName} State: {entry.State}");
                foreach (var prop in entry.Properties)
                {
                    System.Console.WriteLine($"  {prop.Metadata.Name}: {prop.CurrentValue ?? "<null>"}");
                }
            }

            await ctxSeed.SaveChangesAsync();

            var hub = CreateMockHub();

            var ctx1 = CreateContext(dbName);
            var ctx2 = CreateContext(dbName);

            var scopeFactoryMock1 = new Mock<IServiceScopeFactory>();
            var scopeMock1 = new Mock<IServiceScope>();
            var spMock1 = new Mock<IServiceProvider>();
            spMock1.Setup(s => s.GetService(typeof(VeilingContext))).Returns(ctx1);
            spMock1.Setup(s => s.GetService(typeof(IHubContext<AuctionHub>))).Returns(hub);
            scopeMock1.Setup(s => s.ServiceProvider).Returns(spMock1.Object);
            scopeFactoryMock1.Setup(f => f.CreateScope()).Returns(scopeMock1.Object);

            var scopeFactoryMock2 = new Mock<IServiceScopeFactory>();
            var scopeMock2 = new Mock<IServiceScope>();
            var spMock2 = new Mock<IServiceProvider>();
            spMock2.Setup(s => s.GetService(typeof(VeilingContext))).Returns(ctx2);
            spMock2.Setup(s => s.GetService(typeof(IHubContext<AuctionHub>))).Returns(hub);
            scopeMock2.Setup(s => s.ServiceProvider).Returns(spMock2.Object);
            scopeFactoryMock2.Setup(f => f.CreateScope()).Returns(scopeMock2.Object);

            var mgr1 = new AuctionManager(ctx1, hub, scopeFactoryMock1.Object);
            var mgr2 = new AuctionManager(ctx2, hub, scopeFactoryMock2.Object);

            var t1 = Task.Run(() => mgr1.TryBuyProductAsync(1, "b1"));
            var t2 = Task.Run(() => mgr2.TryBuyProductAsync(1, "b2"));

            try
            {
                await Task.WhenAll(t1, t2);
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"Exception during concurrent TryBuy: {ex.GetType().FullName} {ex.Message}");
                DumpEntries(ctx1, "Ctx1 AfterConcurrentFailure");
                DumpEntries(ctx2, "Ctx2 AfterConcurrentFailure");
                throw;
            }

            var successCount = (t1.Result ? 1 : 0) + (t2.Result ? 1 : 0);
            Assert.InRange(successCount, 1, 1); // exactly one succeeded

            // Validate DB state indicates one buyer
            var finalCtx = CreateContext(dbName);
            var p = await finalCtx.Product.FindAsync(1);
            Assert.NotNull(p.gebruiker_id);
            Assert.Equal("GEKOCHT", p.Status);
        }
    }
}
