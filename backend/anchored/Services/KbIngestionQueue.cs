using System.Threading.Channels;

namespace anchored.Services;

public class KbIngestionQueue
{
    private readonly Channel<int> _kbDocumentChannel = Channel.CreateUnbounded<int>();

    public ValueTask EnqueueAsync(int documentId, CancellationToken ct = default) =>
        _kbDocumentChannel.Writer.WriteAsync(documentId, ct);

    public IAsyncEnumerable<int> ReadAllAsync(CancellationToken ct) =>
        _kbDocumentChannel.Reader.ReadAllAsync(ct);
}