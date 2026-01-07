using veilingklok;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using veilingklok.Models;
using Microsoft.AspNetCore.Identity.UI.Services;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddDataProtection();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<RoleManager<IdentityRole>>();
builder.Services.AddScoped<SignInManager<Gebruiker>>();
builder.Services.AddTransient<IEmailSender<Gebruiker>, DummyEmailSender>();
builder.Services.AddAuthentication().AddBearerToken(IdentityConstants.BearerScheme, options => { 
    options.BearerTokenExpiration = TimeSpan.FromMinutes(60.0); });
builder.Services.AddDbContext<VeilingContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddEndpointsApiExplorer();
// ---------------- Swagger + JWT ----------------
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen(options =>
    {
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Description = "Please enter a valid token",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer"
        });
        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Scheme = "Bearer",
                    Reference = new OpenApiReference
                    {
                        Id = "Bearer",
                        Type = ReferenceType.SecurityScheme
                    }
                },
                new List<string>()
            }
        });
    });
}
// ---------------- CORS ----------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ---------------- Identity ----------------
builder.Services.AddIdentity<Gebruiker, IdentityRole>()
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<VeilingContext>();

// ---------------- Dummy Email Sender ----------------
builder.Services.AddTransient<IEmailSender<Gebruiker>, DummyEmailSender>();

// ---------------- JWT Service ----------------

var app = builder.Build();

// ---------------- Seed Roles + Admin ----------------
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Gebruiker>>();

    string[] roles = { "Koper", "Aanvoerder", "Veilingmeester", "Admin" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }

    var password = "Test123!";
    var adminEmail = "admin@example.com";
    var adminUsername = "adminUser";

    if (await userManager.FindByNameAsync(adminUsername) == null)
    {
        var gebruiker = new Gebruiker
        {
            Naam = "Admin",
            UserName = adminUsername,
            EmailConfirmed = true,
        };

        if ((await userManager.CreateAsync(gebruiker, password)).Succeeded)
            await userManager.AddToRoleAsync(gebruiker, "Admin");
    }
}

// ---------------- Middleware ----------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapIdentityApi<Gebruiker>();
app.MapControllers();


app.Run();

// ---------------- Dummy Email Sender ----------------
public class DummyEmailSender : IEmailSender<Gebruiker>
{
    public Task SendConfirmationLinkAsync(Gebruiker user, string email, string confirmationLink)
    {
        throw new NotImplementedException();
    }

    public Task SendPasswordResetCodeAsync(Gebruiker user, string email, string resetCode)
    {
        throw new NotImplementedException();
    }

    public Task SendPasswordResetLinkAsync(Gebruiker user, string email, string resetLink)
    {
        throw new NotImplementedException();
    }
}

// ---------------- JWT Service ----------------
// public class JwtService
// {
//     private readonly IConfiguration _config;

//     public JwtService(IConfiguration config) => _config = config;

//     public string GenerateToken(string userId, string userName, IList<string> roles)
//     {
//         var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "SuperSecretKey123456!"));
//         var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

//         var claims = new List<System.Security.Claims.Claim>
//         {
//             new(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub, userId),
//             new(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.UniqueName, userName)
//         };

//         claims.AddRange(roles.Select(role => new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, role)));

//         var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
//             issuer: _config["Jwt:Issuer"] ?? "veilingklok",
//             audience: _config["Jwt:Audience"] ?? "veilingklok",
//             claims: claims,
//             expires: DateTime.UtcNow.AddMinutes(60),
//             signingCredentials: creds
//         );

//         return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
//     }
//}

// ---------------- JWT Authentication ----------------
// var jwtKey = builder.Configuration["Jwt:Key"] ?? "SuperSecretKey123456!";
// var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "veilingklok";
// var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "veilingklok";

// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
// })
// .AddJwtBearer(options =>
// {
//     options.TokenValidationParameters = new TokenValidationParameters
//     {
//         ValidateIssuer = true,
//         ValidateAudience = true,
//         ValidateLifetime = true,
//         ValidateIssuerSigningKey = true,
//         ValidIssuer = jwtIssuer,
//         ValidAudience = jwtAudience,
//         IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
//     };
// });