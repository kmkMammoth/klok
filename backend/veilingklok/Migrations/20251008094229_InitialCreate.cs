using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace veilingklok.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Gebruiker",
                columns: table => new
                {
                    gebruiker_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    naam = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    wachtwoord_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gebruiker", x => x.gebruiker_id);
                });

            migrationBuilder.CreateTable(
                name: "Aanvoerder",
                columns: table => new
                {
                    aanvoerder_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    gebruiker_id = table.Column<int>(type: "int", nullable: false),
                    kvk_nummer = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    adres = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    iban_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Aanvoerder", x => x.aanvoerder_id);
                    table.ForeignKey(
                        name: "FK_Aanvoerder_Gebruiker_gebruiker_id",
                        column: x => x.gebruiker_id,
                        principalTable: "Gebruiker",
                        principalColumn: "gebruiker_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Koper",
                columns: table => new
                {
                    koper_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    gebruiker_id = table.Column<int>(type: "int", nullable: false),
                    kvk_nummer = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    adres = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    iban_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Koper", x => x.koper_id);
                    table.ForeignKey(
                        name: "FK_Koper_Gebruiker_gebruiker_id",
                        column: x => x.gebruiker_id,
                        principalTable: "Gebruiker",
                        principalColumn: "gebruiker_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Veilingmeester",
                columns: table => new
                {
                    veilingmeester_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    gebruiker_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veilingmeester", x => x.veilingmeester_id);
                    table.ForeignKey(
                        name: "FK_Veilingmeester_Gebruiker_gebruiker_id",
                        column: x => x.gebruiker_id,
                        principalTable: "Gebruiker",
                        principalColumn: "gebruiker_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Product",
                columns: table => new
                {
                    artikel_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    aanvoerder_id = table.Column<int>(type: "int", nullable: false),
                    soort = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    potmaat = table.Column<int>(type: "int", nullable: true),
                    steellengte = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    hoeveelheid = table.Column<int>(type: "int", nullable: true),
                    minimumprijs = table.Column<decimal>(type: "decimal(6,2)", nullable: true),
                    kloklocatie = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    afbeelding = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.artikel_id);
                    table.ForeignKey(
                        name: "FK_Product_Aanvoerder_aanvoerder_id",
                        column: x => x.aanvoerder_id,
                        principalTable: "Aanvoerder",
                        principalColumn: "aanvoerder_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Veiling",
                columns: table => new
                {
                    veiling_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    veilingmeester_id = table.Column<int>(type: "int", nullable: false),
                    artikel_id = table.Column<int>(type: "int", nullable: true),
                    starttijd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    eindtijd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    minimumprijs = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    veilingnaam = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veiling", x => x.veiling_id);
                    table.CheckConstraint("CK_Veiling_Status", "status IN ('Idle', 'Ongoing', 'Done')");
                    table.ForeignKey(
                        name: "FK_Veiling_Product_artikel_id",
                        column: x => x.artikel_id,
                        principalTable: "Product",
                        principalColumn: "artikel_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Veiling_Veilingmeester_veilingmeester_id",
                        column: x => x.veilingmeester_id,
                        principalTable: "Veilingmeester",
                        principalColumn: "veilingmeester_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Bod",
                columns: table => new
                {
                    bod_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    koper_id = table.Column<int>(type: "int", nullable: false),
                    veiling_id = table.Column<int>(type: "int", nullable: false),
                    bedrag = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    tijdstip = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bod", x => x.bod_id);
                    table.ForeignKey(
                        name: "FK_Bod_Koper_koper_id",
                        column: x => x.koper_id,
                        principalTable: "Koper",
                        principalColumn: "koper_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bod_Veiling_veiling_id",
                        column: x => x.veiling_id,
                        principalTable: "Veiling",
                        principalColumn: "veiling_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Aanvoerder_gebruiker_id",
                table: "Aanvoerder",
                column: "gebruiker_id");

            migrationBuilder.CreateIndex(
                name: "IX_Bod_koper_id",
                table: "Bod",
                column: "koper_id");

            migrationBuilder.CreateIndex(
                name: "IX_Bod_veiling_id",
                table: "Bod",
                column: "veiling_id");

            migrationBuilder.CreateIndex(
                name: "IX_Koper_gebruiker_id",
                table: "Koper",
                column: "gebruiker_id");

            migrationBuilder.CreateIndex(
                name: "IX_Product_aanvoerder_id",
                table: "Product",
                column: "aanvoerder_id");

            migrationBuilder.CreateIndex(
                name: "IX_Veiling_artikel_id",
                table: "Veiling",
                column: "artikel_id");

            migrationBuilder.CreateIndex(
                name: "IX_Veiling_veilingmeester_id",
                table: "Veiling",
                column: "veilingmeester_id");

            migrationBuilder.CreateIndex(
                name: "IX_Veilingmeester_gebruiker_id",
                table: "Veilingmeester",
                column: "gebruiker_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bod");

            migrationBuilder.DropTable(
                name: "Koper");

            migrationBuilder.DropTable(
                name: "Veiling");

            migrationBuilder.DropTable(
                name: "Product");

            migrationBuilder.DropTable(
                name: "Veilingmeester");

            migrationBuilder.DropTable(
                name: "Aanvoerder");

            migrationBuilder.DropTable(
                name: "Gebruiker");
        }
    }
}
