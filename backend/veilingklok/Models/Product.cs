﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace veilingklok.Models
{
    public class Product
    {
        [Key]
        [Column("artikel_id")]
        public int ArtikelId { get; set; }

        [Required, ForeignKey("Aanvoerder")]
        [Column("Aanvoerder_id")]
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

        [Column("startprijs", TypeName = "decimal(10,2)")]
        public decimal? StartPrijs { get; set; }

        [Column("increment_per_second", TypeName = "decimal(10,4)")]
        public decimal? IncrementPerSecond { get; set; }

        [MaxLength(100)]
        [Column("kloklocatie")]
        public string? KlokLocatie { get; set; }

        [MaxLength(-1)]
        [Column("afbeelding", TypeName = "nvarchar(max)")]
        public string? Afbeelding { get; set; }

        [ForeignKey("Veiling")]
        [Column("veiling_id")]
        public int? VeilingId { get; set; }

        [ForeignKey("Koper")]
        [Column("koper_id")]
        public string? gebruiker_id { get; set; }

        [MaxLength(50)]
        [Column("status")]
        public string? Status { get; set; }

        public Aanvoerder Aanvoerder { get; set; }
        public Veiling Veiling { get; set; }
        public Koper Koper { get; set; }
    }
}
