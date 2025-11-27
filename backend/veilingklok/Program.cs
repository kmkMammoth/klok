using veilingklok;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
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
