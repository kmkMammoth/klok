using Microsoft.EntityFrameworkCore;
using FloraVeiling.Models;

namespace FloraVeiling.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 配置 User 表
            modelBuilder.Entity<User>(entity =>
            {
                // 设置表名
                entity.ToTable("Users");

                // 配置索引
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Gebruikersnaam);
                entity.HasIndex(e => e.KvkNummer);

                // 配置默认值（SQLite 兼容）
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("datetime('now')");

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.Property(e => e.IsEmailVerified)
                    .HasDefaultValue(false);
            });
        }
    }
}

