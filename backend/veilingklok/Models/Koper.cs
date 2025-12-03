using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace veilingklok.Models
{
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
    }
}
