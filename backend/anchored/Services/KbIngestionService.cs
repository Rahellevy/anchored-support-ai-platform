using anchored.Data;
using anchored.Helpers;
using anchored.Models;
using anchored.Setup;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OpenAI.Embeddings;
using Pgvector;

namespace anchored.Services;

public class KbIngestionService(AppDbContext db, EmbeddingClient embeddingClient, AiUsageRecorder aiUsageRecorder, IOptions<OpenAiOptions> options)
{
    public async Task ProcessAsync(int documentId, CancellationToken ct)
    {
        var doc = await db.KbDocuments.Include(d => d.Chunks).SingleOrDefaultAsync(d => d.Id == documentId, ct);
        if (doc is null) return;

        try
        {
            var text = await TextExtractor.ExtractAsync(doc.StoragePath, doc.FileName, ct);
            var pieces = TextChunker.Chunk(text).ToList();
            var vectors = await embeddingClient.GenerateEmbeddingsAsync(pieces, cancellationToken: ct);

            doc.Chunks.Clear();
            doc.Chunks.AddRange(pieces.Select((t, i) => new KbChunk
            {
                Index = i, Content = t, EmbeddingModel = options.Value.EmbeddingModel,
                Embedding = new Vector(vectors.Value[i].ToFloats()),
            }));
            doc.Status = KbStatus.Ready;
            
            // Record usage
            // embeddings have input tokens only
            var usage = vectors.Value.Usage;
            await aiUsageRecorder.RecordAsync(
                AiPurpose.Embedding,
                options.Value.EmbeddingModel,
                usage.InputTokenCount,
                0,
                0,
                null, // TODO: Retrieve and add userId 
                ct
                );
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            doc.Status = KbStatus.Failed;
        }

        await db.SaveChangesAsync(ct);
    }
}