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
        s_log.Information("Seeding database with users");

        var roles = services.GetRequiredService<RoleManager<IdentityRole>>();
        var config = services.GetRequiredService<IConfiguration>();
        var users = services.GetRequiredService<UserManager<AppUser>>();
        var db = services.GetRequiredService<AppDbContext>();

        foreach (var role in Roles.All)
        {
            if (!await roles.RoleExistsAsync(role))
            {
                await roles.CreateAsync(new IdentityRole(role));
            }
        }

        // ----- Main accounts (credentials from config) -----
        var admin = await AddUser(Roles.Admin, config, users);
        var therapist = await AddUser(Roles.Therapist, config, users);
        var patient = await AddUser(Roles.Patient, config, users);

        await EnsureProfileAsync(db, admin.Id, Roles.Admin, therapistId: null);
        await EnsureProfileAsync(db, therapist.Id, Roles.Therapist, therapistId: null);
        await EnsureProfileAsync(db, patient.Id, Roles.Patient, therapistId: therapist.Id);
        await db.SaveChangesAsync(); // therapist profiles must exist before patients are assigned to them

        // ----- Extra test accounts (one shared password) -----
        var testPassword = config["Seed:TestUsersPassword"];
        if (string.IsNullOrWhiteSpace(testPassword)) testPassword = DefaultTestPassword;

        var idsByEmail = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [MainTherapist] = therapist.Id,
        };

        foreach (var testUser in TestUsers)
        {
            var user = await CreateUserAsync(users, testUser.Email, testPassword, testUser.FirstName,
                testUser.LastName, testUser.Role);
            idsByEmail[testUser.Email] = user.Id;

            var therapistId = testUser.TherapistEmail is { } email ? idsByEmail[email] : null;
            await EnsureProfileAsync(db, user.Id, testUser.Role, therapistId);

            // Save as we go, so a therapist's profile exists before any patient references it
            await db.SaveChangesAsync();
        }

        s_log.Information("Seed data complete. Extra test accounts use password {Password}", testPassword);
    }

    /// <summary>One of the three main accounts, with email and password from config (Seed:{role}:...).</summary>
    public static async Task<AppUser> AddUser(string role, IConfiguration config, UserManager<AppUser> users)
    {
        var userEmail = config[$"Seed:{role}:Email"];
        var userPassword = config[$"Seed:{role}:Password"];
        if (string.IsNullOrWhiteSpace(userEmail) || string.IsNullOrWhiteSpace(userPassword))
        {
            throw new Exception($"Email and or Password set for {role} is null or empty");
        }

        var (firstName, lastName) = role switch
        {
            Roles.Admin => ("Riley", "Chen"),
            Roles.Therapist => ("Morgan", "Hale"),
            Roles.Patient => ("Jordan", "Avery"),
            _ => throw new Exception($"No role exists for {role}")
        };

        return await CreateUserAsync(users, userEmail, userPassword, firstName, lastName, role);
    }

    /// <summary>Creates the user and adds the role, or returns the existing user with that email.</summary>
    private static async Task<AppUser> CreateUserAsync(UserManager<AppUser> users, string email, string password,
        string firstName, string lastName, string role)
    {
        if (await users.FindByEmailAsync(email) is { } existingUser)
        {
            // Repairs a half-finished earlier run where the user was created but the role wasn't added
            if (!await users.IsInRoleAsync(existingUser, role))
                await users.AddToRoleAsync(existingUser, role);
            return existingUser;
        }

        s_log.Information("Seeding {Role} {Email}", role, email);

        var user = new AppUser { UserName = email, Email = email, FirstName = firstName, LastName = lastName };
        var created = await users.CreateAsync(user, password);
        if (!created.Succeeded)
        {
            throw new InvalidOperationException(
                $"Seeding {email} failed: " + string.Join("; ", created.Errors.Select(e => e.Description)));
        }

        await users.AddToRoleAsync(user, role);
        return user;
    }

    /// <summary>Adds the role's profile row if it's missing. Doesn't change existing profiles.</summary>
    private static async Task EnsureProfileAsync(AppDbContext db, string userId, string role, string? therapistId)
    {
        if (role == Roles.Admin && !await db.AdminProfiles.AnyAsync(a => a.UserId == userId))
            db.AdminProfiles.Add(new AdminProfile { UserId = userId });
        else if (role == Roles.Therapist && !await db.TherapistProfiles.AnyAsync(t => t.UserId == userId))
            db.TherapistProfiles.Add(new TherapistProfile { UserId = userId });
        else if (role == Roles.Patient && !await db.PatientProfiles.AnyAsync(p => p.UserId == userId))
            db.PatientProfiles.Add(new PatientProfile { UserId = userId, AssignedTherapistId = therapistId });
    }
}