using System.ComponentModel.DataAnnotations;
using anchored.Hubs;
using Microsoft.Extensions.Options;
using OpenAI.Chat;

namespace anchored.Setup;

public class OpenAiOptions
{
    public const string Section = "OpenAI";
    
    [Required]
    public string ApiKey { get; init; } = "";

    [Required]
    public string ChatModel { get; init; } = "";

    [Required]
    public string EmbeddingModel { get; init; } = "";

    [Range(100, 4000)]
    public int MaxOutputTokens { get; init; } = 1000;
}

public static class ChatFeature
{
    public static IServiceCollection AddChatFeature(this IServiceCollection services)
    {
        services.AddSingleton(sp =>
        {
            var o = sp.GetRequiredService<IOptions<OpenAiOptions>>().Value;
            return new ChatClient(o.ChatModel, o.ApiKey);
        });
        
        services.AddScoped<IChatResponder, OpenAiChatResponder>();

        return services;
    }
}