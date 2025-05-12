using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetLIS.Migrations
{
    /// <inheritdoc />
    public partial class settings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TestParameterSettings",
                columns: table => new
                {
                    Parameter = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Function = table.Column<string>(type: "TEXT", maxLength: 8192, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestParameterSettings", x => x.Parameter);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TestParameterSettings");
        }
    }
}
