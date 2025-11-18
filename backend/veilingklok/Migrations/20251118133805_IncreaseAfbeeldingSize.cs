using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace veilingklok.Migrations
{
    /// <inheritdoc />
    public partial class IncreaseAfbeeldingSize : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Only alter the afbeelding column on Product to nvarchar(max).
            migrationBuilder.AlterColumn<string>(
                name: "afbeelding",
                table: "Product",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert afbeelding column back to nvarchar(255)
            migrationBuilder.AlterColumn<string>(
                name: "afbeelding",
                table: "Product",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }
    }
}
