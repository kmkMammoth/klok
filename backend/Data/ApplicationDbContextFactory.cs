using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace FloraVeiling.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            
            // 使用 SQLite 连接字符串
            optionsBuilder.UseSqlite("Data Source=FloraVeiling.db");
            
            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}

