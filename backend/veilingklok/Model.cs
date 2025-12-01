namespace veilingklok;

using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class VeilingContext : DbContext
{
    public DbSet<Gebruiker> Gebruikers { get; set; }
    public DbSet<Aanvoerder> Aanvoerders { get; set; }
    public DbSet<Koper> Kopers { get; set; }
    public DbSet<Veilingmeester> Veilingmeesters { get; set; }
    public DbSet<Product> Producten { get; set; }
    public DbSet<Veiling> Veilingen { get; set; }   
    public DbSet<Bod> Biedingen { get; set; }

    public VeilingContext(DbContextOptions<VeilingContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Table Per Type (TPT) inheritance configuratie
        modelBuilder.Entity<Gebruiker>().ToTable("Gebruiker");
        modelBuilder.Entity<Aanvoerder>().ToTable("Aanvoerder");
        modelBuilder.Entity<Koper>().ToTable("Koper");
        modelBuilder.Entity<Veilingmeester>().ToTable("Veilingmeester");
        
        // Tabelnamen instellen op enkelvoud voor andere entiteiten
        modelBuilder.Entity<Product>().ToTable("Product");
        modelBuilder.Entity<Veiling>().ToTable("Veiling");
        modelBuilder.Entity<Bod>().ToTable("Bod");

        // Configuratie voor Product -> Aanvoerder foreign key
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Aanvoerder)
            .WithMany(a => a.Producten)
            .HasForeignKey(p => p.AanvoerderId)
            .HasPrincipalKey(a => a.GebruikerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuratie voor Veiling -> Veilingmeester foreign key
        modelBuilder.Entity<Veiling>()
            .HasOne(v => v.Veilingmeester)
            .WithMany(vm => vm.Veilingen)
            .HasForeignKey(v => v.VeilingmeesterId)
            .HasPrincipalKey(vm => vm.GebruikerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuratie voor Bod -> Koper foreign key
        modelBuilder.Entity<Bod>()
            .HasOne(b => b.Koper)
            .WithMany(k => k.Biedingen)
            .HasForeignKey(b => b.KoperId)
            .HasPrincipalKey(k => k.GebruikerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Check constraint voor Veiling status
        modelBuilder.Entity<Veiling>()
            .HasCheckConstraint("CK_Veiling_Status", "status IN ('Idle', 'Ongoing', 'Done')");
        
        // Alle overige foreign keys op restrict zetten
        foreach (var foreignKey in modelBuilder.Model
                    .GetEntityTypes()
                    .SelectMany(e => e.GetForeignKeys())
                    .Where(fk => !fk.IsOwnership && fk.DeleteBehavior != DeleteBehavior.Restrict))
        {
            foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }

}

public class Gebruiker
{
    [Key]
    [Column("gebruiker_id")]
    public int GebruikerId { get; set; }

    [Required, MaxLength(100)]
    [Column("naam")]
    public string Naam { get; set; }

    [Required, MaxLength(255)]
    [Column("wachtwoord_hash")]
    public string WachtwoordHash { get; set; }
}

public class Aanvoerder : Gebruiker
{
    [StringLength(8)]
    [Column("kvk_nummer")]
    public string KvkNummer { get; set; }

    [MaxLength(255)]
    [Column("adres")]
    public string Adres { get; set; }

    [MaxLength(100)]
    [Column("email")]
    public string Email { get; set; }

    [MaxLength(255)]
    [Column("iban_hash")]
    public string IbanHash { get; set; }

    public List<Product> Producten { get; set; } = new();
}

public class Koper : Gebruiker
{
    [StringLength(8)]
    [Column("kvk_nummer")]
    public string KvkNummer { get; set; }

    [MaxLength(255)]
    [Column("adres")]
    public string Adres { get; set; }

    [MaxLength(100)]
    [Column("email")]
    public string Email { get; set; }

    [MaxLength(255)]
    [Column("iban_hash")]
    public string IbanHash { get; set; }

    public List<Bod> Biedingen { get; set; } = new();
}

public class Veilingmeester : Gebruiker
{
    public List<Veiling> Veilingen { get; set; } = new();
}

public class Product
{
    [Key]
    [Column("artikel_id")]
    public int ArtikelId { get; set; }

    [Required, ForeignKey("Aanvoerder")]
    [Column("aanvoerder_id")]
    public int AanvoerderId { get; set; }

    [MaxLength(100)]
    [Column("soort")]
    public string Soort { get; set; }

    [Column("potmaat")]
    public int? Potmaat { get; set; }

    [Column("steellengte", TypeName = "decimal(5,2)")]
    public decimal? Steellengte { get; set; }

    [Column("hoeveelheid")]
    public int? Hoeveelheid { get; set; }

    [Column("minimumprijs", TypeName = "decimal(6,2)")]
    public decimal? MinimumPrijs { get; set; }

    [MaxLength(100)]
    [Column("kloklocatie")]
    public string KlokLocatie { get; set; }

    [MaxLength(-1)]
    [Column("afbeelding", TypeName = "nvarchar(max)")]
    public string Afbeelding { get; set; }

    public Aanvoerder Aanvoerder { get; set; }
    public List<Veiling> Veilingen { get; set; } = new();
}

public class Veiling
{
    [Key]
    [Column("veiling_id")]
    public int VeilingId { get; set; }

    [Required, ForeignKey("Veilingmeester")]
    [Column("veilingmeester_id")]
    public int VeilingmeesterId { get; set; }

    [ForeignKey("Product")]
    [Column("artikel_id")]
    public int? ArtikelId { get; set; }

    [Required]
    [Column("starttijd")]
    public DateTime StartTijd { get; set; }

    [Required]
    [Column("eindtijd")]
    public DateTime EindTijd { get; set; }

    [Required, MaxLength(50)]
    [Column("status")]
    public string Status { get; set; }

    [Column("minimumprijs", TypeName = "decimal(10,2)")]
    public decimal? MinimumPrijs { get; set; }

    [Column("veilingnaam", TypeName = "nvarchar(255)")]
    public string VeilingNaam { get; set; }

    public Veilingmeester Veilingmeester { get; set; }
    public Product Product { get; set; }
    public List<Bod> Biedingen { get; set; } = new();
}

public class Bod
{
    [Key]
    [Column("bod_id")]
    public int BodId { get; set; }

    [Required, ForeignKey("Koper")]
    [Column("koper_id")]
    public int KoperId { get; set; }

    [Required, ForeignKey("Veiling")]
    [Column("veiling_id")]
    public int VeilingId { get; set; }

    [Required]
    [Column("bedrag", TypeName = "decimal(10,2)")]
    public decimal Bedrag { get; set; }

    [Required]
    [Column("tijdstip")]
    public DateTime Tijdstip { get; set; }

    public Koper Koper { get; set; }
    public Veiling Veiling { get; set; }
}
