using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pgvector;

namespace anchored.Models;

public enum KbStatus
{
    Pending,
    Ready,
    Failed
}

public enum KbCategory
{
    PracticeInformation,
    Educational,
    SupportResources,
    Policies,
    FAQ,
}

public class KbDocument
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public required string StoragePath { get; set; }
    public string? Description { get; set; }
    public KbCategory Category { get; set; }
    public KbStatus Status { get; set; } = KbStatus.Pending;
    public bool Enabled { get; set; } = true;
    public required string UploadById { get; set; }
    public string? UpdatedById { get; set; }
    public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;
    public List<KbChunk> Chunks { get; set; } = [];
}

public class KbChunk
{
    public int Id { get; set; }
    public int DocumentId { get; set; }
    public KbDocument Document { get; set; } = default!;
    public int Index { get; set; }
    public required string Content { get; set; }
    public required string EmbeddingModel { get; set; }
    public Vector Embedding { get; set; } = default!;
}

public class UploadKbDocumentRequest
{
    public IFormFile File { get; set; } = default!;
    public string Title { get; set; } = "";
    public KbCategory Category { get; set; }
}

public class KbOptions
{
    public string StoragePath { get; init; } = "/app/data/kb";
}


// DTOs
public record KbDocumentDto(
    int Id,
    string Title,
    string FileName,
    KbCategory Category,
    KbStatus Status,
    bool Enabled,
    DateTimeOffset UploadedAt,
    int ChunkCount
);

public record UpdateKbDocumentRequest(
    string? Title,
    KbCategory? Category,
    bool? Enabled
);

public class KbDocumentConfiguration : IEntityTypeConfiguration<KbDocument>
{
    public void Configure(EntityTypeBuilder<KbDocument> builder)
    {
        builder.ToTable("kb_documents");
        builder.Property(d => d.Title).HasMaxLength(200);
        builder.Property(d => d.FileName).HasMaxLength(255);
        builder.Property(d => d.ContentType).HasMaxLength(100);
        builder.Property(d => d.StoragePath).HasMaxLength(500);
        builder.Property(d => d.Description).HasMaxLength(1000);
        builder.Property(d => d.Category).HasConversion<string>().HasMaxLength(30);
        builder.Property(d => d.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne<AppUser>().WithMany().HasForeignKey(d => d.UploadById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(d => d.Status);
        builder.HasIndex(d => d.Category);
    }
}

public class KbChunkConfiguration : IEntityTypeConfiguration<KbChunk>
{
    public void Configure(EntityTypeBuilder<KbChunk> builder)
    {
        builder.ToTable("kb_chunks");
        builder.Property(c => c.EmbeddingModel).HasMaxLength(100);
        builder.Property(c => c.Embedding).HasColumnType("vector(1536)"); // must match the embedding model

        builder.HasOne(c => c.Document).WithMany(d => d.Chunks)
            .HasForeignKey(c => c.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => c.Embedding).HasMethod("hnsw").HasOperators("vector_cosine_ops");
        builder.HasIndex(c => new { c.DocumentId, c.Index }).IsUnique();
    }
}
