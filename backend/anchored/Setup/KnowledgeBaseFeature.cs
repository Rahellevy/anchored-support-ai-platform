using anchored.Models;
using anchored.Services;
using Microsoft.Extensions.Options;
using OpenAI.Embeddings;

namespace anchored.Setup;

public static class KnowledgeBaseFeature
{
    public static IServiceCollection AddKnowledgeBaseFeature(this IServiceCollection services)
    {
        services.AddOptions<KbOptions>().BindConfiguration("KnowledgeBase");
        services.AddSingleton<KbIngestionQueue>();
        services.AddScoped<KbIngestionService>();
        services.AddHostedService<KbIngestionWorker>();
        
        services.AddSingleton(sp =>
        {
            var o = sp.GetRequiredService<IOptions<OpenAiOptions>>().Value;
            return new EmbeddingClient(o.EmbeddingModel, o.ApiKey);
        });

        return services;
    }
}