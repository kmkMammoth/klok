using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace veilingklok.Migrations
{
    /// <inheritdoc />
    public partial class AddRegistrationSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Aanvoerders_Gebruikers_gebruiker_id",
                table: "Aanvoerders");

            migrationBuilder.DropForeignKey(
                name: "FK_Biedingen_Kopers_koper_id",
                table: "Biedingen");

            migrationBuilder.DropForeignKey(
                name: "FK_Biedingen_Veilingen_veiling_id",
                table: "Biedingen");

            migrationBuilder.DropForeignKey(
                name: "FK_Kopers_Gebruikers_gebruiker_id",
                table: "Kopers");

            migrationBuilder.DropForeignKey(
                name: "FK_Producten_Aanvoerders_aanvoerder_id",
                table: "Producten");

            migrationBuilder.DropForeignKey(
                name: "FK_Veilingen_Producten_artikel_id",
                table: "Veilingen");

            migrationBuilder.DropForeignKey(
                name: "FK_Veilingen_Veilingmeesters_veilingmeester_id",
                table: "Veilingen");

            migrationBuilder.DropForeignKey(
                name: "FK_Veilingmeesters_Gebruikers_gebruiker_id",
                table: "Veilingmeesters");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Veilingmeesters",
                table: "Veilingmeesters");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Veilingen",
                table: "Veilingen");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Producten",
                table: "Producten");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Kopers",
                table: "Kopers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Gebruikers",
                table: "Gebruikers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Biedingen",
                table: "Biedingen");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Aanvoerders",
                table: "Aanvoerders");

            migrationBuilder.RenameTable(
                name: "Veilingmeesters",
                newName: "Veilingmeester");

            migrationBuilder.RenameTable(
                name: "Veilingen",
                newName: "Veiling");

            migrationBuilder.RenameTable(
                name: "Producten",
                newName: "Product");

            migrationBuilder.RenameTable(
                name: "Kopers",
                newName: "Koper");

            migrationBuilder.RenameTable(
                name: "Gebruikers",
                newName: "Gebruiker");

            migrationBuilder.RenameTable(
                name: "Biedingen",
                newName: "Bod");

            migrationBuilder.RenameTable(
                name: "Aanvoerders",
                newName: "Aanvoerder");

            migrationBuilder.RenameIndex(
                name: "IX_Veilingmeesters_gebruiker_id",
                table: "Veilingmeester",
                newName: "IX_Veilingmeester_gebruiker_id");

            migrationBuilder.RenameIndex(
                name: "IX_Veilingen_veilingmeester_id",
                table: "Veiling",
                newName: "IX_Veiling_veilingmeester_id");

            migrationBuilder.RenameIndex(
                name: "IX_Veilingen_artikel_id",
                table: "Veiling",
                newName: "IX_Veiling_artikel_id");

            migrationBuilder.RenameIndex(
                name: "IX_Producten_aanvoerder_id",
                table: "Product",
                newName: "IX_Product_aanvoerder_id");

            migrationBuilder.RenameIndex(
                name: "IX_Kopers_gebruiker_id",
                table: "Koper",
                newName: "IX_Koper_gebruiker_id");

            migrationBuilder.RenameIndex(
                name: "IX_Biedingen_veiling_id",
                table: "Bod",
                newName: "IX_Bod_veiling_id");

            migrationBuilder.RenameIndex(
                name: "IX_Biedingen_koper_id",
                table: "Bod",
                newName: "IX_Bod_koper_id");

            migrationBuilder.RenameIndex(
                name: "IX_Aanvoerders_gebruiker_id",
                table: "Aanvoerder",
                newName: "IX_Aanvoerder_gebruiker_id");

            migrationBuilder.AddColumn<decimal>(
                name: "minimumprijs",
                table: "Veiling",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "veilingnaam",
                table: "Veiling",
                type: "nvarchar(255)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Veilingmeester",
                table: "Veilingmeester",
                column: "veilingmeester_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Veiling",
                table: "Veiling",
                column: "veiling_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Product",
                table: "Product",
                column: "artikel_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Koper",
                table: "Koper",
                column: "koper_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Gebruiker",
                table: "Gebruiker",
                column: "gebruiker_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Bod",
                table: "Bod",
                column: "bod_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Aanvoerder",
                table: "Aanvoerder",
                column: "aanvoerder_id");

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
                name: "FK_Bod_Veiling_veiling_id",
                table: "Bod",
                column: "veiling_id",
                principalTable: "Veiling",
                principalColumn: "veiling_id",
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
                name: "FK_Veiling_Product_artikel_id",
                table: "Veiling",
                column: "artikel_id",
                principalTable: "Product",
                principalColumn: "artikel_id",
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
                name: "FK_Bod_Veiling_veiling_id",
                table: "Bod");

            migrationBuilder.DropForeignKey(
                name: "FK_Koper_Gebruiker_gebruiker_id",
                table: "Koper");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Aanvoerder_aanvoerder_id",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Veiling_Product_artikel_id",
                table: "Veiling");

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
                name: "PK_Veiling",
                table: "Veiling");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Product",
                table: "Product");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Koper",
                table: "Koper");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Gebruiker",
                table: "Gebruiker");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Bod",
                table: "Bod");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Aanvoerder",
                table: "Aanvoerder");

            migrationBuilder.DropColumn(
                name: "minimumprijs",
                table: "Veiling");

            migrationBuilder.DropColumn(
                name: "veilingnaam",
                table: "Veiling");

            migrationBuilder.RenameTable(
                name: "Veilingmeester",
                newName: "Veilingmeesters");

            migrationBuilder.RenameTable(
                name: "Veiling",
                newName: "Veilingen");

            migrationBuilder.RenameTable(
                name: "Product",
                newName: "Producten");

            migrationBuilder.RenameTable(
                name: "Koper",
                newName: "Kopers");

            migrationBuilder.RenameTable(
                name: "Gebruiker",
                newName: "Gebruikers");

            migrationBuilder.RenameTable(
                name: "Bod",
                newName: "Biedingen");

            migrationBuilder.RenameTable(
                name: "Aanvoerder",
                newName: "Aanvoerders");

            migrationBuilder.RenameIndex(
                name: "IX_Veilingmeester_gebruiker_id",
                table: "Veilingmeesters",
                newName: "IX_Veilingmeesters_gebruiker_id");

            migrationBuilder.RenameIndex(
                name: "IX_Veiling_veilingmeester_id",
                table: "Veilingen",
                newName: "IX_Veilingen_veilingmeester_id");

            migrationBuilder.RenameIndex(
                name: "IX_Veiling_artikel_id",
                table: "Veilingen",
                newName: "IX_Veilingen_artikel_id");

            migrationBuilder.RenameIndex(
                name: "IX_Product_aanvoerder_id",
                table: "Producten",
                newName: "IX_Producten_aanvoerder_id");

            migrationBuilder.RenameIndex(
                name: "IX_Koper_gebruiker_id",
                table: "Kopers",
                newName: "IX_Kopers_gebruiker_id");

            migrationBuilder.RenameIndex(
                name: "IX_Bod_veiling_id",
                table: "Biedingen",
                newName: "IX_Biedingen_veiling_id");

            migrationBuilder.RenameIndex(
                name: "IX_Bod_koper_id",
                table: "Biedingen",
                newName: "IX_Biedingen_koper_id");

            migrationBuilder.RenameIndex(
                name: "IX_Aanvoerder_gebruiker_id",
                table: "Aanvoerders",
                newName: "IX_Aanvoerders_gebruiker_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Veilingmeesters",
                table: "Veilingmeesters",
                column: "veilingmeester_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Veilingen",
                table: "Veilingen",
                column: "veiling_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Producten",
                table: "Producten",
                column: "artikel_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Kopers",
                table: "Kopers",
                column: "koper_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Gebruikers",
                table: "Gebruikers",
                column: "gebruiker_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Biedingen",
                table: "Biedingen",
                column: "bod_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Aanvoerders",
                table: "Aanvoerders",
                column: "aanvoerder_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Aanvoerders_Gebruikers_gebruiker_id",
                table: "Aanvoerders",
                column: "gebruiker_id",
                principalTable: "Gebruikers",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Biedingen_Kopers_koper_id",
                table: "Biedingen",
                column: "koper_id",
                principalTable: "Kopers",
                principalColumn: "koper_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Biedingen_Veilingen_veiling_id",
                table: "Biedingen",
                column: "veiling_id",
                principalTable: "Veilingen",
                principalColumn: "veiling_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Kopers_Gebruikers_gebruiker_id",
                table: "Kopers",
                column: "gebruiker_id",
                principalTable: "Gebruikers",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Producten_Aanvoerders_aanvoerder_id",
                table: "Producten",
                column: "aanvoerder_id",
                principalTable: "Aanvoerders",
                principalColumn: "aanvoerder_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veilingen_Producten_artikel_id",
                table: "Veilingen",
                column: "artikel_id",
                principalTable: "Producten",
                principalColumn: "artikel_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veilingen_Veilingmeesters_veilingmeester_id",
                table: "Veilingen",
                column: "veilingmeester_id",
                principalTable: "Veilingmeesters",
                principalColumn: "veilingmeester_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Veilingmeesters_Gebruikers_gebruiker_id",
                table: "Veilingmeesters",
                column: "gebruiker_id",
                principalTable: "Gebruikers",
                principalColumn: "gebruiker_id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
