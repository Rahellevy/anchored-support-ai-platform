using System.ComponentModel.DataAnnotations;
using anchored.Hubs;
using anchored.Setup;
using Microsoft.Extensions.Options;
using OpenAI.Chat;

namespace anchored.Setup;

public class OpenAiOptions
{
    [Required]
    public string ApiKey { get; init; } = "";

    [Required]
    public string Model { get; init; } = "";
}

public static class ChatFeature
{
    public static IServiceCollection AddChatFeature(this IServiceCollection services)
    {
        services.AddOptions<OpenAiOptions>().BindConfiguration("OpenAI")
            .ValidateDataAnnotations().ValidateOnStart();

        services.AddSingleton(sp =>
        {
            var o = sp.GetRequiredService<IOptions<OpenAiOptions>>().Value;
            return new ChatClient(o.Model, o.ApiKey);
        });
        
        services.AddScoped<IChatResponder, OpenAiChatResponder>();

        return services;
    }
}