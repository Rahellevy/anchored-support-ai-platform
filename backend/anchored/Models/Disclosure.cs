using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace anchored.Models;

public enum DisclosureType
{
    FirstUse,
    FirstChat
}

public class DisclosureAcceptance
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = null!;
    public DisclosureType Type { get; set; }
    public DateTimeOffset AcceptedAt { get; set; } = DateTimeOffset.UtcNow;
}

// Disclosure DTO
public record DisclosureStatus(
    [JsonConverter(typeof(StringEnumConverter))]
    DisclosureType Type,
    bool Accepted,
    DateTimeOffset? AcceptedAt
);

// public class DisclosureAcceptanceConfiguration : IEntityTypeConfiguration<DisclosureAcceptance>
// {
//     public void Configure(EntityTypeBuilder<DisclosureAcceptance> builder)
//     {
//         builder.ToTable("disclosure_acceptances");
//         builder.HasKey(d => d.Id);
//         builder.HasOne(d => d.Patient)
//             .WithMany()
//             .HasForeignKey(d => d.UserId)
//             .OnDelete(DeleteBehavior.Cascade);
//
//         builder.Property(d => d.Type).HasConversion<string>().HasMaxLength(20);
//     }
// }