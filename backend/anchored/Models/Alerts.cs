using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace anchored.Models;

public enum AlertStatus
{
    Open,
    Acknowledged
}

public class Alert
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public required string PatientId { get; set; }
    public PatientProfile Patient { get; set; } = default!;
    public Guid ConversationId { get; set; }
    public Guid MessageId { get; set; }
    public Message Message { get; set; } = default!;
    public int? RuleId { get; set; }
    public required string RuleName { get; set; }
    public RedFlagRule? Rule { get; set; }
    public Severity Severity { get; set; }
    public MatchType MatchType { get; set; }
    public string? Reason { get; set; }
    public int RelatedMessages { get; set; }
    public AlertStatus Status { get; set; } = AlertStatus.Open;
    public DateTimeOffset RaisedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AcknowledgedAt { get; set; }
}

public record AlertDto(
    Guid Id,
    string PatientId,
    string PatientName,
    Guid ConversationId,
    Guid FlaggedMessageId,
    int? RuleId,
    string RuleName,
    MatchType MatchType,
    Severity Severity,
    string? Reason, 
    string FlaggedText,
    int RelatedMessages,
    AlertStatus Status,
    DateTimeOffset RaisedAt,
    DateTimeOffset? AcknowledgedAt
);

public class AlertsConfiguration : IEntityTypeConfiguration<Alert>
{
    public void Configure(EntityTypeBuilder<Alert> builder)
    {
        builder.ToTable("alerts");
        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.Severity).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.RuleName).HasMaxLength(100);
        builder.Property(a => a.MatchType).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.Reason).HasMaxLength(500);

        builder.HasOne(a => a.Patient).WithMany().HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<Conversation>().WithMany().HasForeignKey(a => a.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(a => a.Message).WithMany().HasForeignKey(a => a.MessageId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(a => a.Rule).WithMany().HasForeignKey(a => a.RuleId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(a => new { a.PatientId, a.Status });
        builder.HasIndex(a => new { a.ConversationId, a.RuleId, a.Status });
        builder.HasIndex(a => a.RaisedAt);
    }
}
    

