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

                // 配置索引 - Email 不再设置唯一索引，因为 Veilingmeester 可能没有真实 Email
                entity.HasIndex(e => e.Email); // 移除 .IsUnique()
                // Gebruikersnaam 使用条件唯一索引（只对非 NULL 值唯一）
                entity.HasIndex(e => e.Gebruikersnaam)
                    .IsUnique()
                    .HasFilter("\"Gebruikersnaam\" IS NOT NULL"); // SQLite 语法的过滤条件
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

