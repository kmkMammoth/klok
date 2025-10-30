using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FloraVeiling.Migrations
{
    /// <inheritdoc />
    public partial class FinalFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AccountType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Bedrijfsnaam = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    KvkNummer = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Bedrijfsadres = table.Column<string>(type: "TEXT", maxLength: 300, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Iban = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    PasswordHash = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Gebruikersnaam = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now')"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    IsEmailVerified = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Gebruikersnaam",
                table: "Users",
                column: "Gebruikersnaam",
                unique: true,
                filter: "\"Gebruikersnaam\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_KvkNummer",
                table: "Users",
                column: "KvkNummer");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
