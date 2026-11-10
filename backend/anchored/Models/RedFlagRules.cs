using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace anchored.Models;

public enum MatchType
{
    Phrase,
    Llm
}

public enum Severity
{
    Low,
    Medium,
    High
}

/// <summary>A configurable red flag: a phrase regex or llm match, when matched, alerts a clinician.</summary>
public class RedFlagRule
{
    public int Id { get; set; }
    public required string Pattern { get; set; }
    public MatchType MatchType { get; set; }
    public Severity Severity { get; set; }
    public bool Enabled { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

/// <summary>Table mapping — found automatically by ApplyConfigurationsFromAssembly.</summary>
public class RedFlagConfiguration : IEntityTypeConfiguration<RedFlagRule>
{
    public void Configure(EntityTypeBuilder<RedFlagRule> builder)
    {
        builder.ToTable("red_flag_rules");
        builder.Property(r => r.Pattern).HasMaxLength(500).IsRequired();
        builder.Property(r => r.MatchType).HasConversion<string>().HasMaxLength(20);
        builder.Property(r => r.Severity).HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(r => r.Enabled);
    }
}
