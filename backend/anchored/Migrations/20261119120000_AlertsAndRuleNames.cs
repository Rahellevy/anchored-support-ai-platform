using System;
using anchored.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace anchored.Migrations
{
    /// <summary>
    /// Adds the alerts table and RedFlagRule.Name, which the model had but no migration created.
    /// Written by hand (no .Designer.cs): the attributes below are all EF needs to find and apply it.
    /// AppDbContextModelSnapshot.cs was updated to match, so the next `dotnet ef migrations add`
    /// only picks up new changes.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20261119120000_AlertsAndRuleNames")]
    public partial class AlertsAndRuleNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "red_flag_rules",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "alerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<string>(type: "text", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    MessageId = table.Column<Guid>(type: "uuid", nullable: false),
                    RuleId = table.Column<int>(type: "integer", nullable: true),
                    RuleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    MatchType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RelatedMessages = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RaisedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AcknowledgedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_alerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_alerts_conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_alerts_messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "messages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_alerts_patient_profiles_PatientId",
                        column: x => x.PatientId,
                        principalTable: "patient_profiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_alerts_red_flag_rules_RuleId",
                        column: x => x.RuleId,
                        principalTable: "red_flag_rules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_alerts_ConversationId_RuleId_Status",
                table: "alerts",
                columns: new[] { "ConversationId", "RuleId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_alerts_MessageId",
                table: "alerts",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_alerts_PatientId_Status",
                table: "alerts",
                columns: new[] { "PatientId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_alerts_RaisedAt",
                table: "alerts",
                column: "RaisedAt");

            migrationBuilder.CreateIndex(
                name: "IX_alerts_RuleId",
                table: "alerts",
                column: "RuleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "alerts");

            migrationBuilder.DropColumn(name: "Name", table: "red_flag_rules");
        }
    }
}
