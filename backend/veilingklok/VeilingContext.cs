namespace veilingklok;

using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using veilingklok.Models;

public class VeilingContext : IdentityDbContext<Gebruiker>
{
    public DbSet<Gebruiker> Gebruiker { get; set; } //Identity users
    public DbSet<Aanvoerder> Aanvoerder { get; set; }
    public DbSet<Koper> Koper { get; set; }
    public DbSet<Veilingmeester> Veilingmeester { get; set; }
    public DbSet<Product> Product { get; set; }
    public DbSet<Veiling> Veiling { get; set; }   

    public VeilingContext(DbContextOptions<VeilingContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Stel alle tabellen in op enkelvoudige namen
        modelBuilder.Entity<Gebruiker>().ToTable("Gebruiker");
        modelBuilder.Entity<Aanvoerder>().ToTable("Aanvoerder");
        modelBuilder.Entity<Koper>().ToTable("Koper");
        modelBuilder.Entity<Veilingmeester>().ToTable("Veilingmeester");
        modelBuilder.Entity<Product>().ToTable("Product");
        modelBuilder.Entity<Veiling>().ToTable("Veiling");

        // Check constraint voor Veiling status
        modelBuilder.Entity<Veiling>()
            .HasCheckConstraint("CK_Veiling_Status", "status IN ('Idle', 'Ongoing', 'Done')");

        // Alle foreign keys op restrict zetten
        foreach (var foreignKey in modelBuilder.Model
                    .GetEntityTypes()
                    .SelectMany(e => e.GetForeignKeys()))
        {
            foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }
}

