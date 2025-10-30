using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FloraVeiling.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string AccountType { get; set; } // "Koper", "Aanvoerder", "Veilingmeester"

        // 公共字段
        [StringLength(200)]
        public string? Bedrijfsnaam { get; set; }

        [StringLength(50)]
        public string? KvkNummer { get; set; }

        [StringLength(300)]
        public string? Bedrijfsadres { get; set; }

        [EmailAddress]
        [StringLength(200)]
        public string? Email { get; set; }

        [StringLength(100)]
        public string? Iban { get; set; }

        [Required]
        [StringLength(500)]
        public string PasswordHash { get; set; }

        // Veilingmeester 专用字段
        [StringLength(100)]
        public string? Gebruikersnaam { get; set; }

        // 时间戳
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }

        // 账户状态
        public bool IsActive { get; set; } = true;

        public bool IsEmailVerified { get; set; } = false;
    }
}

