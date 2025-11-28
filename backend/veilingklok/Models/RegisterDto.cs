using System.ComponentModel.DataAnnotations;

namespace veilingklok.Models
{
    // Base DTO for registration
    public class RegisterBaseDto
    {
        [Required(ErrorMessage = "Wachtwoord is verplicht")]
        [MinLength(6, ErrorMessage = "Wachtwoord moet minimaal 6 karakters zijn")]
        public string Wachtwoord { get; set; }

        [Required(ErrorMessage = "Bevestig wachtwoord is verplicht")]
        [Compare("Wachtwoord", ErrorMessage = "Wachtwoorden komen niet overeen")]
        public string BevestigWachtwoord { get; set; }
    }

    // Koper Registration DTO
    public class RegisterKoperDto : RegisterBaseDto
    {
        [Required(ErrorMessage = "Bedrijfsnaam is verplicht")]
        [MaxLength(100)]
        public string Bedrijfsnaam { get; set; }

        [Required(ErrorMessage = "KvK-nummer is verplicht")]
        [StringLength(8, ErrorMessage = "KvK-nummer moet 8 cijfers zijn")]
        [RegularExpression(@"^\d{8}$", ErrorMessage = "KvK-nummer moet uit 8 cijfers bestaan")]
        public string KvkNummer { get; set; }

        [Required(ErrorMessage = "Bedrijfsadres is verplicht")]
        [MaxLength(255)]
        public string Bedrijfsadres { get; set; }

        [Required(ErrorMessage = "E-mail is verplicht")]
        [EmailAddress(ErrorMessage = "Ongeldig e-mailadres")]
        [MaxLength(100)]
        public string Email { get; set; }

        [Required(ErrorMessage = "IBAN is verplicht")]
        [MaxLength(34)]
        [RegularExpression(@"^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$", ErrorMessage = "Ongeldig IBAN formaat")]
        public string Iban { get; set; }
    }

    // Aanvoerder Registration DTO
    public class RegisterAanvoerderDto : RegisterBaseDto
    {
        [Required(ErrorMessage = "Bedrijfsnaam is verplicht")]
        [MaxLength(100)]
        public string Bedrijfsnaam { get; set; }

        [Required(ErrorMessage = "KvK-nummer is verplicht")]
        [StringLength(8, ErrorMessage = "KvK-nummer moet 8 cijfers zijn")]
        [RegularExpression(@"^\d{8}$", ErrorMessage = "KvK-nummer moet uit 8 cijfers bestaan")]
        public string KvkNummer { get; set; }

        [Required(ErrorMessage = "Bedrijfsadres is verplicht")]
        [MaxLength(255)]
        public string Bedrijfsadres { get; set; }

        [Required(ErrorMessage = "E-mail is verplicht")]
        [EmailAddress(ErrorMessage = "Ongeldig e-mailadres")]
        [MaxLength(100)]
        public string Email { get; set; }

        [Required(ErrorMessage = "IBAN is verplicht")]
        [MaxLength(34)]
        [RegularExpression(@"^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$", ErrorMessage = "Ongeldig IBAN formaat")]
        public string Iban { get; set; }
    }

    // Veilingmeester Registration DTO
    public class RegisterVeilingmeesterDto : RegisterBaseDto
    {
        [Required(ErrorMessage = "Gebruikersnaam is verplicht")]
        [MaxLength(100)]
        [MinLength(3, ErrorMessage = "Gebruikersnaam moet minimaal 3 karakters zijn")]
        public string Gebruikersnaam { get; set; }
    }

    // Response DTO
    public class RegisterResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string? Role { get; set; }
        public int? UserId { get; set; }
    }
}



