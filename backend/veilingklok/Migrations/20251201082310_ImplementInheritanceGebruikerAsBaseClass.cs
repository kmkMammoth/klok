using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace veilingklok.Migrations
{
    /// <inheritdoc />
    public partial class ImplementInheritanceGebruikerAsBaseClass : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Aanvoerder_Gebruiker_gebruiker_id",
                table: "Aanvoerder");

            migrationBuilder.DropForeignKey(
                name: "FK_Bod_Koper_koper_id",
                table: "Bod");

            migrationBuilder.DropForeignKey(
                name: "FK_Koper_Gebruiker_gebruiker_id",
                table: "Koper");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Aanvoerder_aanvoerder_id",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiling_Veilingmeester_veilingmeester_id",
                table: "Veiling");

            migrationBuilder.DropForeignKey(
                name: "FK_Veilingmeester_Gebruiker_gebruiker_id",
                table: "Veilingmeester");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Veilingmeester",
                table: "Veilingmeester");

            migrationBuilder.DropIndex(
                name: "IX_Veilingmeester_gebruiker_id",
                table: "Veilingmeester");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Koper",
                table: "Koper");

            migrationBuilder.DropIndex(
                name: "IX_Koper_gebruiker_id",
                table: "Koper");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Aanvoerder",
                table: "Aanvoerder");

            migrationBuilder.DropIndex(
                name: "IX_Aanvoerder_gebruiker_id",
                table: "Aanvoerder");

            migrationBuilder.DropColumn(
                name: "veilingmeester_id",
                table: "Veilingmeester");

            migrationBuilder.DropColumn(
                name: "koper_id",
                table: "Koper");

            migrationBuilder.DropColumn(
                name: "aanvoerder_id",
                table: "Aanvoerder");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Veilingmeester",
                table: "Veilingmeester",
                column: "gebruiker_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Koper",
                table: "Koper",
                column: "gebruiker_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Aanvoerder",
                table: "Aanvoerder",
                column: "gebruiker_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Aanvoerder_Gebruiker_gebruiker_id",
                table: "Aanvoerder",
                column: "gebruiker_id",
                principalTable: "Gebruiker",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Bod_Koper_koper_id",
                table: "Bod",
                column: "koper_id",
                principalTable: "Koper",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Koper_Gebruiker_gebruiker_id",
                table: "Koper",
                column: "gebruiker_id",
                principalTable: "Gebruiker",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Aanvoerder_aanvoerder_id",
                table: "Product",
                column: "aanvoerder_id",
                principalTable: "Aanvoerder",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veiling_Veilingmeester_veilingmeester_id",
                table: "Veiling",
                column: "veilingmeester_id",
                principalTable: "Veilingmeester",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veilingmeester_Gebruiker_gebruiker_id",
                table: "Veilingmeester",
                column: "gebruiker_id",
                principalTable: "Gebruiker",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Aanvoerder_Gebruiker_gebruiker_id",
                table: "Aanvoerder");

            migrationBuilder.DropForeignKey(
                name: "FK_Bod_Koper_koper_id",
                table: "Bod");

            migrationBuilder.DropForeignKey(
                name: "FK_Koper_Gebruiker_gebruiker_id",
                table: "Koper");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Aanvoerder_aanvoerder_id",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiling_Veilingmeester_veilingmeester_id",
                table: "Veiling");

            migrationBuilder.DropForeignKey(
                name: "FK_Veilingmeester_Gebruiker_gebruiker_id",
                table: "Veilingmeester");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Veilingmeester",
                table: "Veilingmeester");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Koper",
                table: "Koper");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Aanvoerder",
                table: "Aanvoerder");

            migrationBuilder.AddColumn<int>(
                name: "veilingmeester_id",
                table: "Veilingmeester",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "koper_id",
                table: "Koper",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "aanvoerder_id",
                table: "Aanvoerder",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Veilingmeester",
                table: "Veilingmeester",
                column: "veilingmeester_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Koper",
                table: "Koper",
                column: "koper_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Aanvoerder",
                table: "Aanvoerder",
                column: "aanvoerder_id");

            migrationBuilder.CreateIndex(
                name: "IX_Veilingmeester_gebruiker_id",
                table: "Veilingmeester",
                column: "gebruiker_id");

            migrationBuilder.CreateIndex(
                name: "IX_Koper_gebruiker_id",
                table: "Koper",
                column: "gebruiker_id");

            migrationBuilder.CreateIndex(
                name: "IX_Aanvoerder_gebruiker_id",
                table: "Aanvoerder",
                column: "gebruiker_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Aanvoerder_Gebruiker_gebruiker_id",
                table: "Aanvoerder",
                column: "gebruiker_id",
                principalTable: "Gebruiker",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bod_Koper_koper_id",
                table: "Bod",
                column: "koper_id",
                principalTable: "Koper",
                principalColumn: "koper_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Koper_Gebruiker_gebruiker_id",
                table: "Koper",
                column: "gebruiker_id",
                principalTable: "Gebruiker",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Aanvoerder_aanvoerder_id",
                table: "Product",
                column: "aanvoerder_id",
                principalTable: "Aanvoerder",
                principalColumn: "aanvoerder_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veiling_Veilingmeester_veilingmeester_id",
                table: "Veiling",
                column: "veilingmeester_id",
                principalTable: "Veilingmeester",
                principalColumn: "veilingmeester_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veilingmeester_Gebruiker_gebruiker_id",
                table: "Veilingmeester",
                column: "gebruiker_id",
                principalTable: "Gebruiker",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
