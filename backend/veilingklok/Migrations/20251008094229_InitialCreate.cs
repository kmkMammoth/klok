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
                name: "Gebruikers",
                columns: table => new
                {
                    gebruiker_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    naam = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    wachtwoord_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gebruikers", x => x.gebruiker_id);
                });

            migrationBuilder.CreateTable(
                name: "Aanvoerders",
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
                    table.PrimaryKey("PK_Aanvoerders", x => x.aanvoerder_id);
                    table.ForeignKey(
                        name: "FK_Aanvoerders_Gebruikers_gebruiker_id",
                        column: x => x.gebruiker_id,
                        principalTable: "Gebruikers",
                        principalColumn: "gebruiker_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Kopers",
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
                    table.PrimaryKey("PK_Kopers", x => x.koper_id);
                    table.ForeignKey(
                        name: "FK_Kopers_Gebruikers_gebruiker_id",
                        column: x => x.gebruiker_id,
                        principalTable: "Gebruikers",
                        principalColumn: "gebruiker_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Veilingmeesters",
                columns: table => new
                {
                    veilingmeester_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    gebruiker_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veilingmeesters", x => x.veilingmeester_id);
                    table.ForeignKey(
                        name: "FK_Veilingmeesters_Gebruikers_gebruiker_id",
                        column: x => x.gebruiker_id,
                        principalTable: "Gebruikers",
                        principalColumn: "gebruiker_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Producten",
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
                    afbeelding = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producten", x => x.artikel_id);
                    table.ForeignKey(
                        name: "FK_Producten_Aanvoerders_aanvoerder_id",
                        column: x => x.aanvoerder_id,
                        principalTable: "Aanvoerders",
                        principalColumn: "aanvoerder_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Veilingen",
                columns: table => new
                {
                    veiling_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    veilingmeester_id = table.Column<int>(type: "int", nullable: false),
                    artikel_id = table.Column<int>(type: "int", nullable: true),
                    starttijd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    eindtijd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veilingen", x => x.veiling_id);
                    table.CheckConstraint("CK_Veiling_Status", "status IN ('Idle', 'Ongoing', 'Done')");
                    table.ForeignKey(
                        name: "FK_Veilingen_Producten_artikel_id",
                        column: x => x.artikel_id,
                        principalTable: "Producten",
                        principalColumn: "artikel_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Veilingen_Veilingmeesters_veilingmeester_id",
                        column: x => x.veilingmeester_id,
                        principalTable: "Veilingmeesters",
                        principalColumn: "veilingmeester_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Biedingen",
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
                    table.PrimaryKey("PK_Biedingen", x => x.bod_id);
                    table.ForeignKey(
                        name: "FK_Biedingen_Kopers_koper_id",
                        column: x => x.koper_id,
                        principalTable: "Kopers",
                        principalColumn: "koper_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Biedingen_Veilingen_veiling_id",
                        column: x => x.veiling_id,
                        principalTable: "Veilingen",
                        principalColumn: "veiling_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Aanvoerders_gebruiker_id",
                table: "Aanvoerders",
                column: "gebruiker_id");

            migrationBuilder.CreateIndex(
                name: "IX_Biedingen_koper_id",
                table: "Biedingen",
                column: "koper_id");

            migrationBuilder.CreateIndex(
                name: "IX_Biedingen_veiling_id",
                table: "Biedingen",
                column: "veiling_id");

            migrationBuilder.CreateIndex(
                name: "IX_Kopers_gebruiker_id",
                table: "Kopers",
                column: "gebruiker_id");

            migrationBuilder.CreateIndex(
                name: "IX_Producten_aanvoerder_id",
                table: "Producten",
                column: "aanvoerder_id");

            migrationBuilder.CreateIndex(
                name: "IX_Veilingen_artikel_id",
                table: "Veilingen",
                column: "artikel_id");

            migrationBuilder.CreateIndex(
                name: "IX_Veilingen_veilingmeester_id",
                table: "Veilingen",
                column: "veilingmeester_id");

            migrationBuilder.CreateIndex(
                name: "IX_Veilingmeesters_gebruiker_id",
                table: "Veilingmeesters",
                column: "gebruiker_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Biedingen");

            migrationBuilder.DropTable(
                name: "Kopers");

            migrationBuilder.DropTable(
                name: "Veilingen");

            migrationBuilder.DropTable(
                name: "Producten");

            migrationBuilder.DropTable(
                name: "Veilingmeesters");

            migrationBuilder.DropTable(
                name: "Aanvoerders");

            migrationBuilder.DropTable(
                name: "Gebruikers");
        }
    }
}
