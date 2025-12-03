using veilingklok;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Use PascalCase
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true; // Allow case-insensitive matching
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ Voeg CORS toe zodat frontend requests kan doen
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Voeg VeilingContext toe
builder.Services.AddDbContext<VeilingContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

var app = builder.Build();
// Test Connection
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<VeilingContext>();
    try
    {
        var canConnect = await context.Database.CanConnectAsync();
        Console.WriteLine($"Database connection successful: {canConnect}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database connection failed: {ex.Message}");
    }
}

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ Voeg CORS middleware toe VOOR UseHttpsRedirection
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.MapControllers();

// Test database connectie
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<VeilingContext>();
    var canConnect = await context.Database.CanConnectAsync();
    Console.WriteLine($"Database connection successful: {canConnect}");
}

app.Run();

// Function to create demo accounts
async Task CreateDemoAccounts(VeilingContext db)
{
    try
    {
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            string HashPassword(string password)
            {
                var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }

            // Create Demo Veilingmeester
            if (!await db.Gebruikers.AnyAsync(g => g.Naam == "demo_veilingmeester"))
            {
                var veilingmeesterUser = new Gebruiker
                {
                    Naam = "demo_veilingmeester",
                    WachtwoordHash = HashPassword("demo123")
                };
                db.Gebruikers.Add(veilingmeesterUser);
                await db.SaveChangesAsync();

                var veilingmeester = new Veilingmeester
                {
                    GebruikerId = veilingmeesterUser.GebruikerId
                };
                db.Veilingmeesters.Add(veilingmeester);
                await db.SaveChangesAsync();
                Console.WriteLine("✓ Demo Veilingmeester created: demo_veilingmeester / demo123");
            }

            // Create Demo Koper (commented out until database structure is fixed)
            // if (!await db.Gebruikers.AnyAsync(g => g.Naam == "demo_koper"))
            // {
            //     var koperUser = new Gebruiker
            //     {
            //         Naam = "demo_koper",
            //         WachtwoordHash = HashPassword("demo123")
            //     };
            //     db.Gebruikers.Add(koperUser);
            //     await db.SaveChangesAsync();

            //     var koper = new Koper
            //     {
            //         GebruikerId = koperUser.GebruikerId,
            //         KvkNummer = "12345678",
            //         Adres = "Demo Straat 123, Amsterdam",
            //         Email = "demo_koper@example.com",
            //         IbanHash = HashPassword("NL91ABNA0417164300")
            //     };
            //     db.Kopers.Add(koper);
            //     await db.SaveChangesAsync();
            //     Console.WriteLine("✓ Demo Koper created: demo_koper / demo123");
            // }

            // Create Demo Aanvoerder (commented out until database structure is fixed)
            // if (!await db.Gebruikers.AnyAsync(g => g.Naam == "demo_aanvoerder"))
            // {
            //     var aanvoerderUser = new Gebruiker
            //     {
            //         Naam = "demo_aanvoerder",
            //         WachtwoordHash = HashPassword("demo123")
            //     };
            //     db.Gebruikers.Add(aanvoerderUser);
            //     await db.SaveChangesAsync();

            //     var aanvoerder = new Aanvoerder
            //     {
            //         GebruikerId = aanvoerderUser.GebruikerId,
            //         KvkNummer = "87654321",
            //         Adres = "Demo Weg 456, Rotterdam",
            //         Email = "demo_aanvoerder@example.com",
            //         IbanHash = HashPassword("NL91ABNA0417164301")
            //     };
            //     db.Aanvoerders.Add(aanvoerder);
            //     await db.SaveChangesAsync();
            //     Console.WriteLine("✓ Demo Aanvoerder created: demo_aanvoerder / demo123");
            // }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error creating demo accounts: {ex.Message}");
    }
}
