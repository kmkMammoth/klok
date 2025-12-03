using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace veilingklok.Models
{
    public class Product
    {
        [Key]
        [Column("artikel_id")]
        public int ArtikelId { get; set; }

        [Required, ForeignKey("Aanvoerder")]
        [Column("gebruiker_id")]
        public string Gebruiker_id { get; set; }

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
        public string? KlokLocatie { get; set; }

        [MaxLength(-1)]
        [Column("afbeelding", TypeName = "nvarchar(max)")]
        public string? Afbeelding { get; set; }

        public Aanvoerder Aanvoerder { get; set; }
    }
}
