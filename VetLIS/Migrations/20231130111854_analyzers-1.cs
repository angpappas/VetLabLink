using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetLIS.Migrations
{
    public partial class analyzers1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Analyzers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ApplicationType = table.Column<int>(type: "INTEGER", nullable: false),
                    IP = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Settings = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Analyzers", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Analyzers");
        }
    }
}
