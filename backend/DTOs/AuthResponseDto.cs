namespace FloraVeiling.DTOs
{
    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string? Token { get; set; }
        public UserInfoDto? User { get; set; }
    }

    public class UserInfoDto
    {
        public int Id { get; set; }
        public string AccountType { get; set; }
        public string? Bedrijfsnaam { get; set; }
        public string? Email { get; set; }
        public string? Gebruikersnaam { get; set; }
        public bool IsEmailVerified { get; set; }
    }
}

