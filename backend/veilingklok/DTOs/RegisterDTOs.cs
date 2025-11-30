namespace veilingklok.DTOs;

/// <summary>
/// DTO voor login
/// </summary>
public class LoginDto
{
    public string Gebruikersnaam { get; set; } = string.Empty;
    public string Wachtwoord { get; set; } = string.Empty;
}

/// <summary>
/// DTO voor login response
/// </summary>
public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int GebruikerId { get; set; }
    public string Gebruikersnaam { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty; // "koper", "aanvoerder", "veilingmeester"
    public int? RoleId { get; set; } // KoperId, AanvoerderId, of VeilingmeesterId
}

/// <summary>
/// DTO voor Koper registratie
/// </summary>
public class KoperRegistratieDto
{
    public string Bedrijfsnaam { get; set; } = string.Empty;
    public string KvkNummer { get; set; } = string.Empty;
    public string Bedrijfsadres { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Iban { get; set; } = string.Empty;
    public string Wachtwoord { get; set; } = string.Empty;
    public string BevestigWachtwoord { get; set; } = string.Empty;
}

/// <summary>
/// DTO voor Aanvoerder registratie
/// </summary>
public class AanvoerderRegistratieDto
{
    public string Bedrijfsnaam { get; set; } = string.Empty;
    public string KvkNummer { get; set; } = string.Empty;
    public string Bedrijfsadres { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Iban { get; set; } = string.Empty;
    public string Wachtwoord { get; set; } = string.Empty;
    public string BevestigWachtwoord { get; set; } = string.Empty;
}

/// <summary>
/// DTO voor Veilingmeester registratie
/// </summary>
public class VeilingmeesterRegistratieDto
{
    public string Gebruikersnaam { get; set; } = string.Empty;
    public string Wachtwoord { get; set; } = string.Empty;
    public string BevestigWachtwoord { get; set; } = string.Empty;
}

/// <summary>
/// DTO voor registratie response
/// </summary>
public class RegistratieResponseDto
{
    public string Message { get; set; } = string.Empty;
    public int GebruikerId { get; set; }
    public int? KoperId { get; set; }
    public int? AanvoerderId { get; set; }
    public int? VeilingmeesterId { get; set; }
}

/// <summary>
/// DTO voor error response
/// </summary>
public class ErrorResponseDto
{
    public string Message { get; set; } = string.Empty;
    public string? Error { get; set; }
}

