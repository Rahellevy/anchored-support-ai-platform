using anchored.Data;
using anchored.Setup;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.Options;

namespace anchored.Models;

public enum AiPurpose
{
    ChatReply,
    RedFlagCheck,
    Embedding
}

public class AiUsage
{
    public long Id { get; set; }
    public AiPurpose Purpose { get; set; }
    public required string Model { get; set; }
    public int InputTokens { get; set; }
    public int CachedInputTokens { get; set; }
    public int OutputTokens { get; set; }
    public decimal CostUsd { get; set; }
    public string? UserId { get; set; }
    public DateTimeOffset At { get; set; } = DateTimeOffset.UtcNow;
}

public class ModelPrice
{
    public decimal InputPerMillion { get; init; }
    public decimal CachedInputPerMillion { get; init; }
    public decimal OutputPerMillion { get; set; }
}

public class AiPricingOptions
{
    public const string Section = "AiPricing";
    public decimal BudgetUsd { get; init; } = 50;
    public Dictionary<string, ModelPrice> Models { get; init; } = [];
}

public class AiUsageConfiguration : IEntityTypeConfiguration<AiUsage>
{
    public void Configure(EntityTypeBuilder<AiUsage> builder)
    {
        builder.ToTable("ai_usage");
        builder.Property(u => u.Purpose).HasConversion<string>().HasMaxLength(20);
        builder.Property(u => u.Model).HasMaxLength(100);
        builder.Property(u => u.CostUsd).HasPrecision(12, 6);
        builder.HasIndex(u => u.At);
        builder.HasIndex(u => new { u.UserId, u.At });
    }
}