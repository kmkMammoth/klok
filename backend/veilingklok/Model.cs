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
    public DbSet<VeilingProduct> VeilingProducten { get; set; }
    public DbSet<Bod> Biedingen { get; set; }

    public VeilingContext(DbContextOptions<VeilingContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Stel alle tabellen in op enkelvoudige namen
        modelBuilder.Entity<Gebruiker>().ToTable("Gebruiker");
        modelBuilder.Entity<Aanvoerder>().ToTable("Aanvoerder");
        modelBuilder.Entity<Koper>().ToTable("Koper");
        modelBuilder.Entity<Veilingmeester>().ToTable("Veilingmeester");
        modelBuilder.Entity<Product>().ToTable("Product");
        modelBuilder.Entity<Veiling>().ToTable("Veiling");
        modelBuilder.Entity<VeilingProduct>().ToTable("VeilingProduct");
        modelBuilder.Entity<Bod>().ToTable("Bod");

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

    public List<Aanvoerder> Aanvoerders { get; set; } = new();
    public List<Koper> Kopers { get; set; } = new();
}

public class Aanvoerder
{
    [Key]
    [Column("aanvoerder_id")]
    public int AanvoerderId { get; set; }

    [Required, ForeignKey("Gebruiker")]
    [Column("gebruiker_id")]
    public int GebruikerId { get; set; }

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

    public Gebruiker Gebruiker { get; set; }
    public List<Product> Producten { get; set; } = new();
}

public class Koper
{
    [Key]
    [Column("koper_id")]
    public int KoperId { get; set; }

    [Required, ForeignKey("Gebruiker")]
    [Column("gebruiker_id")]
    public int GebruikerId { get; set; }

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

    public Gebruiker Gebruiker { get; set; }
    public List<Bod> Biedingen { get; set; } = new();
}

public class Veilingmeester
{
    [Key]
    [Column("gebruiker_id")]
    public int VeilingmeesterId { get; set; }

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
    public List<VeilingProduct> VeilingProducten { get; set; } = new();
}

public class Veiling
{
    [Key]
    [Column("veiling_id")]
    public int VeilingId { get; set; }

    [Required, ForeignKey("Veilingmeester")]
    [Column("veilingmeester_id")]
    public int VeilingmeesterId { get; set; }

    [Required]
    [Column("starttijd")]
    public DateTime StartTijd { get; set; }

    [Required]
    [Column("eindtijd")]
    public DateTime EindTijd { get; set; }

    [Required, MaxLength(50)]
    [Column("status")]
    public string Status { get; set; }

    [Column("veilingnaam", TypeName = "nvarchar(255)")]
    public string VeilingNaam { get; set; }

    [MaxLength(500)]
    [Column("adres", TypeName = "nvarchar(500)")]
    public string Adres { get; set; }

    public Veilingmeester Veilingmeester { get; set; }
    public List<VeilingProduct> VeilingProducten { get; set; } = new();
    public List<Bod> Biedingen { get; set; } = new();
}

public class VeilingProduct
{
    [Key]
    [Column("veiling_product_id")]
    public int VeilingProductId { get; set; }

    [Required, ForeignKey("Veiling")]
    [Column("veiling_id")]
    public int VeilingId { get; set; }

    [Required, ForeignKey("Product")]
    [Column("artikel_id")]
    public int ArtikelId { get; set; }

    [Required]
    [Column("startprijs", TypeName = "decimal(10,2)")]
    public decimal StartPrijs { get; set; }

    [Required]
    [Column("prijsreductie_bedrag", TypeName = "decimal(10,2)")]
    public decimal PrijsreductieBedrag { get; set; }

    [Required]
    [Column("prijsreductie_interval", TypeName = "int")]
    public int PrijsreductieInterval { get; set; } // in seconds

    [Required]
    [Column("huidige_prijs", TypeName = "decimal(10,2)")]
    public decimal HuidigePrijs { get; set; }

    [Column("laatste_reductie_tijd")]
    public DateTime? LaatsteReductieTijd { get; set; }

    public Veiling Veiling { get; set; }
    public Product Product { get; set; }
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
