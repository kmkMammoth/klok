using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace veilingklok.Migrations
{
    /// <inheritdoc />
    public partial class AddVeilingProductTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VeilingProduct",
                columns: table => new
                {
                    veiling_product_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    veiling_id = table.Column<int>(type: "int", nullable: false),
                    artikel_id = table.Column<int>(type: "int", nullable: false),
                    startprijs = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    prijsreductie_bedrag = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    prijsreductie_interval = table.Column<int>(type: "int", nullable: false),
                    huidige_prijs = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    laatste_reductie_tijd = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VeilingProduct", x => x.veiling_product_id);
                    table.ForeignKey(
                        name: "FK_VeilingProduct_Product_artikel_id",
                        column: x => x.artikel_id,
                        principalTable: "Product",
                        principalColumn: "artikel_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VeilingProduct_Veiling_veiling_id",
                        column: x => x.veiling_id,
                        principalTable: "Veiling",
                        principalColumn: "veiling_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VeilingProduct_artikel_id",
                table: "VeilingProduct",
                column: "artikel_id");

            migrationBuilder.CreateIndex(
                name: "IX_VeilingProduct_veiling_id",
                table: "VeilingProduct",
                column: "veiling_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VeilingProduct");
        }
    }
}
