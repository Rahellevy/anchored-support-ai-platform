using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace anchored.Models;

public class Conversation
{
    public Guid Id { get; set; } = Guid.CreateVersion7(); // time-ordered GUIDs
    public string PatientId { get; set; } = null!;
    public AppUser Patient { get; set; } = null!;
    public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset LastMessageAt { get; set; } = DateTimeOffset.UtcNow;
    public List<Message> Messages { get; set; } = [];
}

public enum MessageSender
{
    Patient,
    Assistant
}

public class Message
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public MessageSender Sender { get; set; }
    [MaxLength(40000)]
    public string Content { get; set; } = null!;
    public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
}

public record MessageDto(Guid Id, Guid ConversationId, MessageSender Sender, string Content, DateTimeOffset SentAt)
{
    public static MessageDto From(Message m) => new(m.Id, m.ConversationId, m.Sender, m.Content, m.SentAt);
}

public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("conversations");
        builder.HasKey(c => c.Id);
        builder.HasOne(c => c.Patient)
            .WithMany()
            .HasForeignKey(c => c.PatientId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany<Message>(m => m.Messages)
            .WithOne(m => m.Conversation)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(c => c.PatientId).IsUnique();
        
        // might need to update migrations
    }
}

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("messages");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Content)
            .HasMaxLength(4000)
            .IsRequired();
        builder.Property(m => m.Sender)
            .HasConversion<string>()
            .HasMaxLength(20);
        builder.HasIndex(m => new { m.ConversationId, m.SentAt });
    }
}
