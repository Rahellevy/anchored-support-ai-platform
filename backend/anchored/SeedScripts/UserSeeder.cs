using anchored.Models;
using Microsoft.AspNetCore.Identity;

namespace anchored.SeedScripts;

public static class UserSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        // Always create ALL roles before trying to create the seed administrator.
        foreach (var role in Roles.All)
        {
            if (await roleManager.RoleExistsAsync(role))
                continue;

            var result = await roleManager.CreateAsync(new IdentityRole(role));
            if (!result.Succeeded)
                throw new InvalidOperationException(
                    $"Creating role '{role}' failed: " +
                    string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        var config = services.GetRequiredService<IConfiguration>();
        var adminEmail = config["SeedAdmin:Email"]?.Trim();
        var adminPassword = config["SeedAdmin:Password"];

        // No seed-admin credentials? The roles are still available for registration.
        if (string.IsNullOrWhiteSpace(adminEmail) ||
            string.IsNullOrWhiteSpace(adminPassword))
            return;

        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var existing = await userManager.FindByEmailAsync(adminEmail);
        if (existing is not null)
        {
            // Never silently promote an existing patient/therapist just because
            // its email happens to match the configured seed-admin email.
            if (!await userManager.IsInRoleAsync(existing, Roles.Admin))
                throw new InvalidOperationException(
                    "Seed admin email is already registered to a non-admin account.");
            return;
        }

        var admin = new AppUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "Admin",
            LastName = "Account"
        };

        var created = await userManager.CreateAsync(admin, adminPassword);
        if (!created.Succeeded)
            throw new InvalidOperationException(
                "Creating seed admin failed: " +
                string.Join("; ", created.Errors.Select(e => e.Description)));

        var assigned = await userManager.AddToRoleAsync(admin, Roles.Admin);
        if (!assigned.Succeeded)
            throw new InvalidOperationException(
                "Assigning Admin role failed: " +
                string.Join("; ", assigned.Errors.Select(e => e.Description)));
    }
}
