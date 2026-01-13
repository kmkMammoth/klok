using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace veilingklok.Models;

public class GekochtProduct
{
    [Key]
    [Column("Id")]
    public int? Id { get; set; }

    [Required, ForeignKey("Gebruiker")]
    [Column("koper_id")]
    public string? GebruikerId { get; set; }

    [Required, ForeignKey("Product")]
    [Column("product_id")]
    public int? ProductId { get; set; }

    [Column("hoeveelheid")]
    public int? Hoeveelheid { get; set; }

    [Column("koopprijs", TypeName = "decimal(10,2)")]
    public decimal? KoopPrijs { get; set; }

    [Column("KoopDatum")]
    public DateTime? KoopDatum { get; set; }
}