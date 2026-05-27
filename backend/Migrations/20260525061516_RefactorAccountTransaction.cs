using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace solexp.Migrations
{
    /// <inheritdoc />
    public partial class RefactorAccountTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "id_student",
                table: "AccountTransactions");

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "AccountTransactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "id_lesson_student",
                table: "AccountTransactions",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "description",
                table: "AccountTransactions");

            migrationBuilder.DropColumn(
                name: "id_lesson_student",
                table: "AccountTransactions");

            migrationBuilder.AddColumn<int>(
                name: "id_student",
                table: "AccountTransactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
