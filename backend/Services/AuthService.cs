using FloraVeiling.Data;
using FloraVeiling.DTOs;
using FloraVeiling.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;

namespace FloraVeiling.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                // 验证账户类型
                if (registerDto.AccountType != "Koper" && 
                    registerDto.AccountType != "Aanvoerder" && 
                    registerDto.AccountType != "Veilingmeester")
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid account type"
                    };
                }

                // 根据账户类型验证必填字段
                if (registerDto.AccountType == "Veilingmeester")
                {
                    if (string.IsNullOrWhiteSpace(registerDto.Gebruikersnaam))
                    {
                        return new AuthResponseDto
                        {
                            Success = false,
                            Message = "Gebruikersnaam is required for Veilingmeester"
                        };
                    }

                    // 检查用户名是否已存在
                    if (await _context.Users.AnyAsync(u => u.Gebruikersnaam == registerDto.Gebruikersnaam))
                    {
                        return new AuthResponseDto
                        {
                            Success = false,
                            Message = "Gebruikersnaam already exists"
                        };
                    }
                }
                else // Koper or Aanvoerder
                {
                    if (string.IsNullOrWhiteSpace(registerDto.Email))
                    {
                        return new AuthResponseDto
                        {
                            Success = false,
                            Message = "Email is required"
                        };
                    }

                    // 检查邮箱是否已存在
                    if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                    {
                        return new AuthResponseDto
                        {
                            Success = false,
                            Message = "Email already exists"
                        };
                    }
                }

                // 创建新用户
                var user = new User
                {
                    AccountType = registerDto.AccountType,
                    Bedrijfsnaam = registerDto.Bedrijfsnaam,
                    KvkNummer = registerDto.KvkNummer,
                    Bedrijfsadres = registerDto.Bedrijfsadres,
                    Email = registerDto.Email ?? string.Empty,
                    Iban = registerDto.Iban,
                    Gebruikersnaam = registerDto.Gebruikersnaam,
                    PasswordHash = HashPassword(registerDto.Wachtwoord),
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    IsEmailVerified = false
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // 生成 JWT Token
                var token = GenerateJwtToken(user.Id, user.AccountType);

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Registration successful",
                    Token = token,
                    User = new UserInfoDto
                    {
                        Id = user.Id,
                        AccountType = user.AccountType,
                        Bedrijfsnaam = user.Bedrijfsnaam,
                        Email = user.Email,
                        Gebruikersnaam = user.Gebruikersnaam,
                        IsEmailVerified = user.IsEmailVerified
                    }
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Registration failed: {ex.Message}"
                };
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                // 查找用户（通过 Email 或 Username）
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => 
                        u.Email == loginDto.EmailOrUsername || 
                        u.Gebruikersnaam == loginDto.EmailOrUsername);

                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid credentials"
                    };
                }

                // 验证密码
                if (!VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid credentials"
                    };
                }

                // 检查账户是否激活
                if (!user.IsActive)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Account is deactivated"
                    };
                }

                // 生成 JWT Token
                var token = GenerateJwtToken(user.Id, user.AccountType);

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    User = new UserInfoDto
                    {
                        Id = user.Id,
                        AccountType = user.AccountType,
                        Bedrijfsnaam = user.Bedrijfsnaam,
                        Email = user.Email,
                        Gebruikersnaam = user.Gebruikersnaam,
                        IsEmailVerified = user.IsEmailVerified
                    }
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Login failed: {ex.Message}"
                };
            }
        }

        public async Task<bool> UserExistsAsync(string emailOrUsername)
        {
            return await _context.Users
                .AnyAsync(u => u.Email == emailOrUsername || u.Gebruikersnaam == emailOrUsername);
        }

        public string GenerateJwtToken(int userId, string accountType)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"]);

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim("accountType", accountType),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // 密码哈希 - 使用 BCrypt（更安全）
        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
        }

        // 验证密码 - 使用 BCrypt
        private bool VerifyPassword(string password, string hashedPassword)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch
            {
                return false;
            }
        }
    }
}

