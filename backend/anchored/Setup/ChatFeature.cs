using anchored.Chat;

namespace anchored.Setup;

public static class ChatFeature
{
    public static IServiceCollection AddChatFeature(this IServiceCollection services)
    {
        services.AddScoped<IChatResponder, PlaceHolderChatResponder>();

        return services;
    }
}