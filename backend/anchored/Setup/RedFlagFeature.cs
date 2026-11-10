using anchored.Services;

namespace anchored.Setup;

/// <summary>Service registration for the Red Flags feature. Called once from Program.cs.</summary>
public static class RedFlagsFeature
{
    public static IServiceCollection AddRedFlagsFeature(this IServiceCollection services)
    {
        services.AddScoped<RedFlagMatcher>();
        return services;
    }
}