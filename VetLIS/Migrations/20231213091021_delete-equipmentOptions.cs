using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VetLIS.Migrations
{
    public partial class deleteequipmentOptions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EquipmentOptions",
                table: "Settings");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EquipmentOptions",
                table: "Settings",
                type: "TEXT",
                nullable: true);
        }
    }
}
