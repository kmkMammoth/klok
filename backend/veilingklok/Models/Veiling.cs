using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace veilingklok.Models
{

    public class Veiling
    {
        [Key]
        [Column("veiling_id")]
        public int VeilingId { get; set; }

        [Required, ForeignKey("Veilingmeester")]
        [Column("gebruiker_id")]
        public string Gebruiker_id { get; set; }

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

        [Column("koopprijs", TypeName = "decimal(10,2)")]
        public decimal? Koopprijs { get; set; }

        [Column("veilingnaam", TypeName = "nvarchar(255)")]
        public string VeilingNaam { get; set; }

        [ForeignKey("Koper")]
        [Column("klant_id")]
        public string? KlantId { get; set; }

        public Veilingmeester Veilingmeester { get; set; }
        public Koper Koper { get; set; }
        public List<Product> Producten { get; set; } = new List<Product>();
    }
}
