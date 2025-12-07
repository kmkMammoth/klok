using veilingklok;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

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

// Test database connectie and create VeilingProduct table if needed
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<VeilingContext>();
    var canConnect = await context.Database.CanConnectAsync();
    Console.WriteLine($"Database connection successful: {canConnect}");
    
    // Create VeilingProduct table if it doesn't exist, enforce huidige_prijs NOT NULL, and mark migrations applied
    try
    {
        await using var conn = new SqlConnection(context.Database.GetConnectionString());
        await conn.OpenAsync();
        var sql = @"
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VeilingProduct]') AND type = 'U')
BEGIN
    CREATE TABLE [VeilingProduct] (
        [veiling_product_id] int NOT NULL IDENTITY(1,1),
        [veiling_id] int NOT NULL,
        [artikel_id] int NOT NULL,
        [startprijs] decimal(10,2) NOT NULL,
        [prijsreductie_bedrag] decimal(10,2) NOT NULL,
        [prijsreductie_interval] int NOT NULL,
        [huidige_prijs] decimal(10,2) NOT NULL CONSTRAINT DF_VeilingProduct_huidige_prijs DEFAULT(0),
        [laatste_reductie_tijd] datetime2 NULL,
        CONSTRAINT [PK_VeilingProduct] PRIMARY KEY ([veiling_product_id]),
        CONSTRAINT [FK_VeilingProduct_Product_artikel_id] FOREIGN KEY ([artikel_id]) REFERENCES [Product]([artikel_id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_VeilingProduct_Veiling_veiling_id] FOREIGN KEY ([veiling_id]) REFERENCES [Veiling]([veiling_id]) ON DELETE NO ACTION
    );
    CREATE INDEX [IX_VeilingProduct_artikel_id] ON [VeilingProduct]([artikel_id]);
    CREATE INDEX [IX_VeilingProduct_veiling_id] ON [VeilingProduct]([veiling_id]);
END;

IF COL_LENGTH('VeilingProduct','huidige_prijs') IS NOT NULL
BEGIN
    UPDATE VeilingProduct SET huidige_prijs = 0 WHERE huidige_prijs IS NULL;
    ALTER TABLE VeilingProduct ALTER COLUMN huidige_prijs decimal(10,2) NOT NULL;
END;

IF NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId='20251008094229_InitialCreate')
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20251008094229_InitialCreate','9.0.9');
IF NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId='20251118133805_IncreaseAfbeeldingSize')
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20251118133805_IncreaseAfbeeldingSize','9.0.9');
IF NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId='20251206212637_AddVeilingProductTable')
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20251206212637_AddVeilingProductTable','9.0.9');
IF NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId='20251206214823_MakeHuidigePrijsRequired')
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20251206214823_MakeHuidigePrijsRequired','9.0.9');
";
        await using (var cmd = new SqlCommand(sql, conn))
        {
            await cmd.ExecuteNonQueryAsync();
        }
        await conn.CloseAsync();
        
        Console.WriteLine("✓ VeilingProduct table and migration history ensured");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠ Warning creating VeilingProduct table: {ex.Message}");
    }
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
                VeilingmeesterId = veilingmeesterUser.GebruikerId
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
