using anchored.Data;
using anchored.SeedScripts;
using Microsoft.EntityFrameworkCore;

namespace anchored;

public static class Startup
{
    /// <summary>Applies pending EF migrations, then seeds roles and the first admin.</summary>
    public static async Task MigrateAndSeedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateAsyncScope();
        var services = scope.ServiceProvider;
        
        // dev only. will remove in prod
        await services.GetRequiredService<AppDbContext>().Database.MigrateAsync();
        await UserSeeder.SeedAsync(services);
    }
}