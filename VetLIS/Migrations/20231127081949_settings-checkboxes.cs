using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetLIS.Migrations
{
    public partial class settingscheckboxes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationTypes",
                table: "Settings",
                type: "TEXT",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicationTypes",
                table: "Settings");
        }
    }
}
