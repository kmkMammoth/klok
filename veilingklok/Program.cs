using veilingklok;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Register your DbContext with DI.
// If your VeilingContext configures the provider in OnConfiguring(), this is enough:
builder.Services.AddDbContext<VeilingContext>();

// Otherwise, configure your provider explicitly, e.g. SQL Server (uncomment and adjust):
// builder.Services.AddDbContext<VeilingContext>(options =>
//     options.UseSqlServer("Name=ConnectionStrings:DefaultConnection")); // <-- use your connection string name

var app = builder.Build();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use attribute-routed controllers (e.g., LoginController)
app.MapControllers();

app.Run();