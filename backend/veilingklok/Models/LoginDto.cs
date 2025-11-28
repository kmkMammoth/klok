using System.ComponentModel.DataAnnotations;

namespace veilingklok.Models
{
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Gebruikersnaam of email is verplicht")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Wachtwoord is verplicht")]
        public string Password { get; set; }
    }

    public class LoginResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string? Role { get; set; }
        public int? UserId { get; set; }
        public string? Name { get; set; }
        public UserDetailsDto? UserDetails { get; set; }
    }

    public class UserDetailsDto
    {
        public int GebruikerId { get; set; }
        public string Naam { get; set; }
        public string Role { get; set; }
        public int? RoleId { get; set; }
        
        // For Koper and Aanvoerder
        public string? Email { get; set; }
        public string? KvkNummer { get; set; }
        public string? Adres { get; set; }
    }
}


