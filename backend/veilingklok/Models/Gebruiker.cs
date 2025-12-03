using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace veilingklok.Models
{
    public class Gebruiker : IdentityUser
    {
        [Required, MaxLength(100)]
        [Column("naam")]
        public string Naam { get; set; }
    }
}