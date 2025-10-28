using System.ComponentModel.DataAnnotations;

namespace FloraVeiling.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Account type is required")]
        public string AccountType { get; set; } // "Koper", "Aanvoerder", "Veilingmeester"

        // Koper and Aanvoerder fields
        public string? Bedrijfsnaam { get; set; }

        public string? KvkNummer { get; set; }

        public string? Bedrijfsadres { get; set; }

        public string? Iban { get; set; }

        // Email for Koper and Aanvoerder
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? Email { get; set; }

        // Veilingmeester field
        public string? Gebruikersnaam { get; set; }

        // Common fields
        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
        public string Wachtwoord { get; set; }

        [Required(ErrorMessage = "Password confirmation is required")]
        [Compare("Wachtwoord", ErrorMessage = "Passwords do not match")]
        public string BevestigWachtwoord { get; set; }
    }
}

