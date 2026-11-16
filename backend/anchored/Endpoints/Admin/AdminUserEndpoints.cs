using System.ComponentModel.DataAnnotations;
using System.Globalization;
using anchored.Data;
using anchored.DTOs.Admin;
using anchored.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace anchored.Endpoints.Admin;

/// <summary>
/// Account administration and patient–therapist assignments.
/// These routes define their own Admin-only group and do not alter the red-flag endpoints.
/// </summary>
public static class AdminUserEndpoints
{
    public static RouteGroupBuilder MapAdminUserEndpoints(this RouteGroupBuilder api)
    {
        var admins = api.MapGroup("/admins")
            .WithTags("Admins")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Admin));

        admins.MapGet("/users", GetUsers);
        admins.MapPost("/users", CreateUser);
        admins.MapPut("/users/{userId}", UpdateUser);
        admins.MapPut("/patients/{patientId}/therapist", SetPatientTherapist);
        return api;
    }

    private static async Task<IResult> GetUsers(AppDbContext db)
    {
        // Two queries avoid one database round trip per account when reading roles.
        var roleRows = await (
            from membership in db.UserRoles.AsNoTracking()
            join role in db.Roles.AsNoTracking() on membership.RoleId equals role.Id
            select new { membership.UserId, RoleName = role.Name }
        ).ToListAsync();

        var rolesByUser = roleRows
            .GroupBy(row => row.UserId)
            .ToDictionary(
                rows => rows.Key,
                rows => rows.Select(row => row.RoleName)
                    .FirstOrDefault(role => role is Roles.Admin or Roles.Therapist or Roles.Patient));

        var accounts = await db.Users.AsNoTracking()
            .OrderBy(u => u.LastName).ThenBy(u => u.FirstName)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                TherapistId = u.PatientProfile == null ? null : u.PatientProfile.AssignedTherapistId,
                AcceptedAt = u.PatientProfile != null && u.PatientProfile.FirstUseDisclosureAck != null
                    ? (DateTimeOffset?)u.PatientProfile.FirstUseDisclosureAck.AcceptedAt
                    : null
            })
            .ToListAsync();

        var result = accounts
            .Where(u => rolesByUser.TryGetValue(u.Id, out var role) && role != null)
            .Select(u =>
            {
                var role = rolesByUser[u.Id]!;
                return new ManagedUserResponse(
                    u.Id,
                    $"{u.FirstName} {u.LastName}",
                    u.FirstName,
                    u.LastName,
                    u.Email ?? string.Empty,
                    role,
                    role == Roles.Patient ? u.TherapistId : null,
                    DisclosureLabel(role, u.AcceptedAt),
                    "Active");
            })
            .ToList();

        return TypedResults.Ok(result);
    }

    private static async Task<IResult> CreateUser(
        CreateManagedUserRequest request,
        AppDbContext db,
        UserManager<AppUser> userManager)
    {
        var errors = ValidateDetails(request.FirstName, request.LastName, request.Email);
        if (!Roles.All.Contains(request.Role, StringComparer.Ordinal))
            errors["role"] = ["Choose Patient, Therapist, or Admin."];
        if (string.IsNullOrWhiteSpace(request.Password))
            errors["password"] = ["A temporary password is required."];
        if (errors.Count != 0) return TypedResults.ValidationProblem(errors);

        var email = request.Email.Trim();
        if (await userManager.FindByEmailAsync(email) is not null)
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                { ["email"] = ["An account with this email already exists."] });

        var user = new AppUser
        {
            UserName = email,
            Email = email,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim()
        };

        await using var transaction = await db.Database.BeginTransactionAsync();
        var created = await userManager.CreateAsync(user, request.Password);
        if (!created.Succeeded)
            return IdentityErrors(created);

        var assignedRole = await userManager.AddToRoleAsync(user, request.Role);
        if (!assignedRole.Succeeded)
            return IdentityErrors(assignedRole);

        switch (request.Role)
        {
            case Roles.Patient:
                db.PatientProfiles.Add(new PatientProfile { UserId = user.Id });
                break;
            case Roles.Therapist:
                db.TherapistProfiles.Add(new TherapistProfile { UserId = user.Id });
                break;
            case Roles.Admin:
                db.AdminProfiles.Add(new AdminProfile { UserId = user.Id });
                break;
        }

        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        // The password is not logged, included in the response, or stored in plaintext.
        return TypedResults.Created($"/api/admins/users/{user.Id}",
            new ManagedUserResponse(user.Id, $"{user.FirstName} {user.LastName}",
                user.FirstName, user.LastName, email, request.Role, null,
                DisclosureLabel(request.Role, null), "Active"));
    }

    private static async Task<IResult> UpdateUser(
        string userId,
        UpdateManagedUserRequest request,
        AppDbContext db,
        UserManager<AppUser> userManager)
    {
        var errors = ValidateDetails(request.FirstName, request.LastName, request.Email);
        if (errors.Count != 0) return TypedResults.ValidationProblem(errors);

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return TypedResults.NotFound();

        var email = request.Email.Trim();
        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null && existing.Id != user.Id)
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                { ["email"] = ["An account with this email already exists."] });

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        // Keep username and email synchronized: the existing login uses email as username.
        user.Email = email;
        user.UserName = email;
        var updated = await userManager.UpdateAsync(user);
        if (!updated.Succeeded) return IdentityErrors(updated);

        var roles = await userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault(r => Roles.All.Contains(r, StringComparer.Ordinal));
        var patient = await db.PatientProfiles.AsNoTracking()
            .Include(p => p.FirstUseDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == user.Id);

        return TypedResults.Ok(new ManagedUserResponse(user.Id,
            $"{user.FirstName} {user.LastName}", user.FirstName, user.LastName,
            email, role ?? string.Empty,
            patient?.AssignedTherapistId,
            DisclosureLabel(role, patient?.FirstUseDisclosureAck?.AcceptedAt), "Active"));
    }

    private static async Task<IResult> SetPatientTherapist(
        string patientId,
        AssignTherapistRequest request,
        AppDbContext db)
    {
        var patient = await db.PatientProfiles.SingleOrDefaultAsync(p => p.UserId == patientId);
        if (patient is null) return TypedResults.NotFound();

        // An arbitrary user ID must not be accepted as a therapist.
        if (request.TherapistId is { } therapistId &&
            !await db.TherapistProfiles.AnyAsync(t => t.UserId == therapistId))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                { ["therapistId"] = ["Select an existing therapist account."] });
        }

        patient.AssignedTherapistId = request.TherapistId;
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    private static Dictionary<string, string[]> ValidateDetails(string? firstName, string? lastName, string? email)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(firstName) || firstName.Trim().Length > 50)
            errors["firstName"] = ["First name is required (maximum 50 characters)."];
        if (string.IsNullOrWhiteSpace(lastName) || lastName.Trim().Length > 50)
            errors["lastName"] = ["Last name is required (maximum 50 characters)."];
        if (string.IsNullOrWhiteSpace(email) || !new EmailAddressAttribute().IsValid(email.Trim()))
            errors["email"] = ["Enter a valid email address."];
        return errors;
    }

    private static string DisclosureLabel(string? role, DateTimeOffset? acknowledgedAt) =>
        role != Roles.Patient ? "Not required" : acknowledgedAt.HasValue
            ? $"Acknowledged {acknowledgedAt.Value.ToString("MMM d", CultureInfo.InvariantCulture)}"
            : "Pending";

    private static IResult IdentityErrors(IdentityResult result) =>
        TypedResults.ValidationProblem(result.Errors
            .GroupBy(e => e.Code)
            .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray()));
}
