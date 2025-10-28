using FloraVeiling.DTOs;
using System.Threading.Tasks;

namespace FloraVeiling.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<bool> UserExistsAsync(string emailOrUsername);
        string GenerateJwtToken(int userId, string accountType);
    }
}

