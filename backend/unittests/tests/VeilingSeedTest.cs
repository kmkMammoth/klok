using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using veilingklok;
using veilingklok.Models;
using Xunit;

namespace unittests
{
    public class VeilingSeedTest
    {
        [Fact]
        public void CanSeedVeilingWithRequiredFields()
        {
            var services = new ServiceCollection();
            services.AddDbContext<VeilingContext>(opt => opt.UseInMemoryDatabase("seed_test_1"));
            var provider = services.BuildServiceProvider();

            using (var scope = provider.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<VeilingContext>();
                var v = new Veiling { VeilingId = 1, Gebruiker_id = "vm1", VeilingNaam = "SeedTest", Status = "Idle", StartTijd = DateTime.UtcNow, EindTijd = DateTime.UtcNow.AddHours(1) };
                ctx.Veiling.Add(v);
                ctx.SaveChanges();
            }
        }
    }
}
