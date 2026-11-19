using anchored.Data;
using anchored.Models;
using Microsoft.EntityFrameworkCore;
using Serilog;
using ILogger = Serilog.ILogger;

namespace anchored.Services;

public class KbIngestionWorker(KbIngestionQueue queue, IServiceScopeFactory scopes) : BackgroundService
{
    private static ILogger s_log = Log.ForContext<KbIngestionWorker>();
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RequeuePendingAsync(stoppingToken);

        await foreach (var id in queue.ReadAllAsync(stoppingToken))
        {
            try
            {
                using var scope = scopes.CreateScope();
                await scope.ServiceProvider.GetRequiredService<KbIngestionService>().ProcessAsync(id, stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                s_log.Error(ex, "Ingestion failed for document {DocumentId}", id);
            }
        }
    }

    private async Task RequeuePendingAsync(CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var ids = await db.KbDocuments.Where(d => d.Status == KbStatus.Pending).Select(d => d.Id).ToListAsync(ct);
        foreach (var id in ids)
        {
            await queue.EnqueueAsync(id, ct);
        }
    }
}