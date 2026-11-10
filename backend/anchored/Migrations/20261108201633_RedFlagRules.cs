using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace anchored.Migrations
{
    /// <inheritdoc />
    public partial class RedFlagRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_conversations_PatientId_LastMessageAt",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "AckDisclosure",
                table: "patient_profiles");

            migrationBuilder.DropColumn(
                name: "DisclosureAck",
                table: "conversations");

            migrationBuilder.AddColumn<Guid>(
                name: "FirstChatDisclosureAckId",
                table: "patient_profiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FirstUseDisclosureAckId",
                table: "patient_profiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DisclosureAcceptance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    AcceptedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisclosureAcceptance", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "red_flag_rules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Pattern = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MatchType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_red_flag_rules", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_patient_profiles_FirstChatDisclosureAckId",
                table: "patient_profiles",
                column: "FirstChatDisclosureAckId");

            migrationBuilder.CreateIndex(
                name: "IX_patient_profiles_FirstUseDisclosureAckId",
                table: "patient_profiles",
                column: "FirstUseDisclosureAckId");

            migrationBuilder.CreateIndex(
                name: "IX_conversations_PatientId",
                table: "conversations",
                column: "PatientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_red_flag_rules_Enabled",
                table: "red_flag_rules",
                column: "Enabled");

            migrationBuilder.AddForeignKey(
                name: "FK_patient_profiles_DisclosureAcceptance_FirstChatDisclosureAc~",
                table: "patient_profiles",
                column: "FirstChatDisclosureAckId",
                principalTable: "DisclosureAcceptance",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_patient_profiles_DisclosureAcceptance_FirstUseDisclosureAck~",
                table: "patient_profiles",
                column: "FirstUseDisclosureAckId",
                principalTable: "DisclosureAcceptance",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_patient_profiles_DisclosureAcceptance_FirstChatDisclosureAc~",
                table: "patient_profiles");

            migrationBuilder.DropForeignKey(
                name: "FK_patient_profiles_DisclosureAcceptance_FirstUseDisclosureAck~",
                table: "patient_profiles");

            migrationBuilder.DropTable(
                name: "DisclosureAcceptance");

            migrationBuilder.DropTable(
                name: "red_flag_rules");

            migrationBuilder.DropIndex(
                name: "IX_patient_profiles_FirstChatDisclosureAckId",
                table: "patient_profiles");

            migrationBuilder.DropIndex(
                name: "IX_patient_profiles_FirstUseDisclosureAckId",
                table: "patient_profiles");

            migrationBuilder.DropIndex(
                name: "IX_conversations_PatientId",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "FirstChatDisclosureAckId",
                table: "patient_profiles");

            migrationBuilder.DropColumn(
                name: "FirstUseDisclosureAckId",
                table: "patient_profiles");

            migrationBuilder.AddColumn<bool>(
                name: "AckDisclosure",
                table: "patient_profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DisclosureAck",
                table: "conversations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_conversations_PatientId_LastMessageAt",
                table: "conversations",
                columns: new[] { "PatientId", "LastMessageAt" });
        }
    }
}
