using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IdPPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveApplicationIsFirstParty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_first_party",
                table: "applications");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_first_party",
                table: "applications",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
