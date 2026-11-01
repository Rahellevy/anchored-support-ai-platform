using anchored.Models;
using Microsoft.AspNetCore.Identity;

namespace anchored.SeedScripts;

public static class UserSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roles = services.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var role in Roles.All)
        {
            if (!await roles.RoleExistsAsync(role))
            {
                await roles.CreateAsync(new IdentityRole(role));
            }

            var config = services.GetRequiredService<IConfiguration>();
            var adminEmail = config["SeedAdmin:Email"];
            var adminPassword = config["SeedAdmin:Password"];
            if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
            {
                return;
            }

            var users = services.GetRequiredService<UserManager<AppUser>>();
            {
                if (await users.FindByEmailAsync(adminEmail) is not null)
                {
                    return;
                }

                var admin = new AppUser
                    { UserName = adminEmail, Email = adminEmail, FirstName = "admin", LastName = "admin" };
                var created = await users.CreateAsync(admin, adminPassword);
                if (!created.Succeeded)
                {
                    throw new InvalidOperationException(
                        "Seeding admin failed: " + string.Join("; ", created.Errors.Select(e => e.Description)));
                }

                await users.AddToRoleAsync(admin, Roles.Admin);
            }
        }
    }
}