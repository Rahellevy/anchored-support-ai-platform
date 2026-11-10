using anchored.Data;
using anchored.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
        
        var admin = await AddUser(Roles.Admin, config, users);
        var therapist = await AddUser(Roles.Therapist, config, users);
        var patient = await AddUser(Roles.Patient, config, users);
        
        // Set Profiles
        if (!await db.AdminProfiles.AnyAsync(a => a.UserId == admin.Id))
        {
            db.AdminProfiles.Add(new AdminProfile { UserId = admin.Id });   
            s_log.Information("Admin profile created");
        }

        if (!await db.TherapistProfiles.AnyAsync(t => t.UserId == therapist.Id))
        {
            db.TherapistProfiles.Add(new TherapistProfile { UserId = therapist.Id});  
            s_log.Information("Therapist profile created");
        }

        if (!await db.PatientProfiles.AnyAsync(p => p.UserId == patient.Id))
        {
            db.PatientProfiles.Add(new PatientProfile { UserId = patient.Id, AssignedTherapistId = therapist.Id});
            s_log.Information("Patient profile created");
        }

        await db.SaveChangesAsync();
        s_log.Information("Seed data complete");
    }

    public static async Task<AppUser> AddUser(string role, IConfiguration config, UserManager<AppUser> users)
    {
        var userEmail = config[$"Seed:{role}:Email"];
        var userPassword = config[$"Seed:{role}:Password"];
        if (string.IsNullOrWhiteSpace(userEmail) || string.IsNullOrWhiteSpace(userPassword))
        {
            throw new Exception($"Email and or Password set for {role} is null or empty");
        }

        s_log.Information("Seeding {Role}... with email: {Email} and password: {Password}", role, userEmail,
            userPassword);

        {
            if (await users.FindByEmailAsync(userEmail) is { } existingUser)
            {
                s_log.Warning("User for {Role} role already set by {Email} ", role, userEmail);
                return existingUser;
            }

            var (firstName, lastName) = (role) switch
            {
                Roles.Admin => ("Riley", "Chen"),
                Roles.Therapist => ("Morgan", "Hale"),
                Roles.Patient => ("Jordan", "Avery"),
                _ => throw new Exception($"No role exists for {role}")
            };

            var user = new AppUser
                { UserName = userEmail, Email = userEmail, FirstName = firstName, LastName = lastName };
            var created = await users.CreateAsync(user, userPassword);
            if (!created.Succeeded)
            {
                throw new InvalidOperationException(
                    "Seeding user failed: " + string.Join("; ", created.Errors.Select(e => e.Description)));
            }

            await users.AddToRoleAsync(user, role);
            return user;
        }
    }
}