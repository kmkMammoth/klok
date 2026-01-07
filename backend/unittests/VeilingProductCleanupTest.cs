using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using veilingklok;
using veilingklok.Models;
using veilingklok.Services;

namespace unittests
{
    public class VeilingProductCleanupTest
    {
        private VeilingContext CreateContext(string name)
        {
            var options = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<VeilingContext>()
                .UseInMemoryDatabase(name)
                .EnableSensitiveDataLogging()
                .EnableDetailedErrors()
                .Options;
            return new VeilingContext(options);
        }

        [Fact]
        public async System.Threading.Tasks.Task DeleteAuction_ClearsProductRuntimeState()
        {
            var ctx = CreateContext("cleanup_test");
var v = new Veiling { VeilingId = 1, Gebruiker_id = "vm1", VeilingNaam = "Cleanup Test", Status = "Ongoing", StartTijd = DateTime.UtcNow.AddMinutes(-5), EindTijd = DateTime.UtcNow.AddMinutes(60) };
            ctx.Veiling.Add(v);
            await ctx.SaveChangesAsync();

            var p = new Product { ArtikelId = 1, Soort = "TestPlant", Gebruiker_id = "a1", VeilingId = 1, StartPrijs = 10m, IncrementPerSecond = 0.1m, StartedAtUtc = DateTime.UtcNow.AddSeconds(-5), Status = "RUNNING", gebruiker_id = "k1", KoopPrijs = 5m };
            ctx.Product.Add(p);

            // Inspect entries before saving cleanup seed
            foreach (var entry in ctx.ChangeTracker.Entries())
            {
                var t = entry.Entity.GetType();
                System.Console.WriteLine($"Cleanup BeforeSave Entry Type: {t.FullName} State: {entry.State}");
                foreach (var prop in entry.Properties)
                {
                    System.Console.WriteLine($"  {prop.Metadata.Name}: {prop.CurrentValue ?? "<null>"}");
                }
            }

            await ctx.SaveChangesAsync();

            var auctionManagerMock = new Mock<IAuctionManager>();
            var controller = new AuctionsController(ctx, auctionManagerMock.Object);

            // Delete the auction
            var result = await controller.DeleteAuction(1);
            Assert.IsType<OkResult>(result);

            // The product should be detached from any veiling and its runtime fields cleared
            var product = await ctx.Product.FindAsync(1);
            Assert.Null(product.VeilingId);
            Assert.Null(product.StartedAtUtc);
            Assert.Null(product.KoopPrijs);
            Assert.Null(product.gebruiker_id);
            Assert.Equal("BESCHIKBAAR", product.Status);
        }
    }
}
