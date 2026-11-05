using anchored.Models;
using Microsoft.AspNetCore.Identity;
using Serilog;
using ILogger = Serilog.ILogger;

namespace anchored.SeedScripts;

public static class UserSeeder
{
    private static readonly ILogger s_log = Log.ForContext(typeof(UserSeeder));
    
    public static async Task SeedAsync(IServiceProvider services)
    {
        s_log.Information("Seeding database with users");
        
        var roles = services.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var role in Roles.All)
        {
            s_log.Information("Seeding {Role}...", role);
            
            if (!await roles.RoleExistsAsync(role))
            {
                await roles.CreateAsync(new IdentityRole(role));
            }
            
            var config = services.GetRequiredService<IConfiguration>();
            var userEmail = config[$"Seed:{role}:Email"];
            var userPassword = config[$"Seed:{role}:Password"];
            if (string.IsNullOrWhiteSpace(userEmail) || string.IsNullOrWhiteSpace(userPassword))
            {
                continue;
            }
            
            s_log.Information("Seeding {Role}... with email: {Email} and password: {Password}", role, userEmail, userPassword);

            var users = services.GetRequiredService<UserManager<AppUser>>();
            {
                if (await users.FindByEmailAsync(userEmail) is not null)
                {
                    continue;
                }

                var user = new AppUser
                    { UserName = userEmail, Email = userEmail, FirstName = $"{role}_user", LastName = $"{role}_user" };
                var created = await users.CreateAsync(user, userPassword);
                if (!created.Succeeded)
                {
                    throw new InvalidOperationException(
                        "Seeding user failed: " + string.Join("; ", created.Errors.Select(e => e.Description)));
                }

                await users.AddToRoleAsync(user, role);
            }
        }
    }
}