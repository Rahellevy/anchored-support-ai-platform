using anchored.Data;
using Microsoft.Extensions.Options;
using Serilog;
using ILogger = Serilog.ILogger;

namespace anchored.Models;

public class AiUsageRecorder(AppDbContext db, IOptions<AiPricingOptions> pricing)
{
    private static readonly ILogger s_log = Log.ForContext<AiUsageRecorder>();

    public async Task RecordAsync(AiPurpose purpose, string model, int input, int cached, int output, string? userId, CancellationToken ct)
    {
        if (!pricing.Value.Models.TryGetValue(model, out var price))
        {
            s_log.Warning("No price configured for {Model}; cost recorded as 0", model);
            price = new ModelPrice();
        }

        var cost = ((input - cached) * price.InputPerMillion + cached * price.CachedInputPerMillion
                                                             + output * price.OutputPerMillion) / 1_000_000m;

        db.AiUsages.Add(new AiUsage
        {
            Purpose = purpose,
            Model = model,
            InputTokens = input,
            CachedInputTokens = cached,
            OutputTokens = output,
            CostUsd = cost,
            UserId = userId
        });
        await db.SaveChangesAsync(ct);
    }
}