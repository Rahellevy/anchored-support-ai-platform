using anchored.Data;
using anchored.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;
using ILogger = Serilog.ILogger;

namespace anchored.SeedScripts;

/// <summary>
/// Development seed data: roles, the three main accounts from config (Seed:Admin/Therapist/Patient),
/// and extra test accounts. Safe to run on every startup: existing users and profiles are left alone.
/// </summary>
public static class UserSeeder
{
    private static readonly ILogger s_log = Log.ForContext(typeof(UserSeeder));

    /// <summary>Used for every extra test account unless Seed:TestUsersPassword is set.</summary>
    private const string DefaultTestPassword = "Anchor3dTest!";

    /// <summary>An extra test account. Patients name their therapist by email (null = unassigned).</summary>
    private record TestUser(string Email, string FirstName, string LastName, string Role, string? TherapistEmail = null);

    // The main therapist (Seed:Therapist:Email) is "main"; it's resolved from config at runtime.
    private const string MainTherapist = "main";

    private static readonly TestUser[] TestUsers =
    [
        // Admin
        new("sam.patel@anchored.com", "Sam", "Patel", Roles.Admin),

        // Therapists (listed before patients so they exist when patients are assigned)
        new("alex.kim@anchored.com", "Alex", "Kim", Roles.Therapist),
        new("priya.shah@anchored.com", "Priya", "Shah", Roles.Therapist),
        new("daniel.ortiz@anchored.com", "Daniel", "Ortiz", Roles.Therapist),

        // Patients: spread across therapists, two unassigned for testing the Users page
        new("sam.rivera@anchored.com", "Sam", "Rivera", Roles.Patient, MainTherapist),
        new("priya.nair@anchored.com", "Priya", "Nair", Roles.Patient, MainTherapist),
        new("marcus.lee@anchored.com", "Marcus", "Lee", Roles.Patient, MainTherapist),
        new("elena.torres@anchored.com", "Elena", "Torres", Roles.Patient, "alex.kim@anchored.com"),
        new("casey.morgan@anchored.com", "Casey", "Morgan", Roles.Patient, "alex.kim@anchored.com"),
        new("taylor.brooks@anchored.com", "Taylor", "Brooks", Roles.Patient, "priya.shah@anchored.com"),
        new("jamie.park@anchored.com", "Jamie", "Park", Roles.Patient),
        new("avery.quinn@anchored.com", "Avery", "Quinn", Roles.Patient),
    ];

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
