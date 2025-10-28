using FloraVeiling.DTOs;
using FloraVeiling.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace FloraVeiling.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// 用户注册
        /// </summary>
        /// <param name="registerDto">注册信息</param>
        /// <returns>注册结果</returns>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid registration data",
                });
            }

            try
            {
                _logger.LogInformation($"Registration attempt for account type: {registerDto.AccountType}");

                var result = await _authService.RegisterAsync(registerDto);

                if (!result.Success)
                {
                    _logger.LogWarning($"Registration failed: {result.Message}");
                    return BadRequest(result);
                }

                _logger.LogInformation($"User registered successfully: {result.User?.Email ?? result.User?.Gebruikersnaam}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }

        /// <summary>
        /// 用户登录
        /// </summary>
        /// <param name="loginDto">登录信息</param>
        /// <returns>登录结果（包含JWT Token）</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid login data"
                });
            }

            try
            {
                _logger.LogInformation($"Login attempt for: {loginDto.EmailOrUsername}");

                var result = await _authService.LoginAsync(loginDto);

                if (!result.Success)
                {
                    _logger.LogWarning($"Login failed for: {loginDto.EmailOrUsername}");
                    return Unauthorized(result);
                }

                _logger.LogInformation($"User logged in successfully: {loginDto.EmailOrUsername}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }

        /// <summary>
        /// 检查用户是否存在
        /// </summary>
        /// <param name="emailOrUsername">邮箱或用户名</param>
        /// <returns>是否存在</returns>
        [HttpGet("exists")]
        [AllowAnonymous]
        public async Task<IActionResult> UserExists([FromQuery] string emailOrUsername)
        {
            if (string.IsNullOrWhiteSpace(emailOrUsername))
            {
                return BadRequest(new { exists = false, message = "Email or username is required" });
            }

            try
            {
                var exists = await _authService.UserExistsAsync(emailOrUsername);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking user existence");
                return StatusCode(500, new { exists = false, message = "An error occurred" });
            }
        }

        /// <summary>
        /// 测试受保护的端点（需要JWT Token）
        /// </summary>
        [HttpGet("protected")]
        [Authorize]
        public IActionResult Protected()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var accountType = User.FindFirst("accountType")?.Value;

            return Ok(new
            {
                message = "You are authenticated!",
                userId,
                accountType
            });
        }

        /// <summary>
        /// 健康检查端点
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "Flora Veiling Auth API"
            });
        }
    }
}

