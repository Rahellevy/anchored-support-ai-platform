using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using anchored.Data;
using anchored.DTOs.Auth;
using anchored.Models;
using Microsoft.AspNetCore.Identity;

namespace anchored.Endpoints.Auth;

/// <summary>Endpoints under /api/auth.</summary>
public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/auth").WithTags("Auth");

        // Public registration creates PATIENT accounts only; never accept a role from the request.
        group.MapPost("/register", Register).AllowAnonymous();
        group.MapPost("/login", Login).AllowAnonymous();
        group.MapPost("/logout", Logout).RequireAuthorization();
        group.MapPost("/me", Me).RequireAuthorization();

        return api;
    }

    private static async Task<IResult> Register(
        RegisterRequest request,
        UserManager<AppUser> userManager,
        AppDbContext db)
    {
        // The current Minimal API project doesn't enable automatic data-annotation
        // validation, so validate the request explicitly.
        var errors = ValidateRegistration(request);
        if (errors.Count > 0)
            return TypedResults.ValidationProblem(errors);

        var user = new AppUser
        {
            UserName = request.Username.Trim(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            PhoneNumber = request.PhoneNumber.Trim()
        };

        // Identity saves the user immediately. The transaction ensures that a
        // failed role assignment or profile save cannot leave a half-created account.
        await using var transaction = await db.Database.BeginTransactionAsync();

        var creationResult = await userManager.CreateAsync(user, request.Password);
        if (!creationResult.Succeeded)
            return TypedResults.ValidationProblem(ToErrors(creationResult));

        var roleResult = await userManager.AddToRoleAsync(user, Roles.Patient);
        if (!roleResult.Succeeded)
            return TypedResults.ValidationProblem(ToErrors(roleResult));

        db.PatientProfiles.Add(new PatientProfile { UserId = user.Id });
        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return TypedResults.Created("/api/auth/me", await ToResponse(user, userManager));
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        SignInManager<AppUser> signInManager,
        UserManager<AppUser> userManager)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return TypedResults.Unauthorized();
        }

        // IMPORTANT: The string overload of PasswordSignInAsync looks up a USERNAME.
        // We accept an email, so look up the user first and use the USER overload.
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null)
            return TypedResults.Unauthorized();

        var result = await signInManager.PasswordSignInAsync(
            user, request.Password, isPersistent: false, lockoutOnFailure: true);

        // Keep the response generic for invalid passwords and locked-out accounts.
        if (!result.Succeeded)
            return TypedResults.Unauthorized();

        return TypedResults.Ok(await ToResponse(user, userManager));
    }

    private static async Task<IResult> Me(
        ClaimsPrincipal claimsPrincipal,
        UserManager<AppUser> userManager)
    {
        var user = await userManager.GetUserAsync(claimsPrincipal);
        return user is null
            ? TypedResults.Unauthorized()
            : TypedResults.Ok(await ToResponse(user, userManager));
    }

    private static async Task<IResult> Logout(SignInManager<AppUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return TypedResults.NoContent();
    }

    private static async Task<UserResponse> ToResponse(
        AppUser user,
        UserManager<AppUser> userManager) =>
        new(user.Id, user.Email!, user.FirstName, user.LastName,
            await userManager.GetRolesAsync(user));

    private static Dictionary<string, string[]> ToErrors(IdentityResult result) =>
        result.Errors
            .GroupBy(e => e.Code)
            .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray());

    private static Dictionary<string, string[]> ValidateRegistration(RegisterRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.FirstName) || request.FirstName.Trim().Length > 50)
            errors["firstName"] = ["First name is required and must be 50 characters or fewer."];

        if (string.IsNullOrWhiteSpace(request.LastName) || request.LastName.Trim().Length > 50)
            errors["lastName"] = ["Last name is required and must be 50 characters or fewer."];

        if (string.IsNullOrWhiteSpace(request.Username))
            errors["username"] = ["Username is required."];

        if (string.IsNullOrWhiteSpace(request.Email) ||
            !new EmailAddressAttribute().IsValid(request.Email.Trim()))
            errors["email"] = ["A valid email address is required."];

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            errors["password"] = ["Password must contain at least 8 characters."];

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            errors["phoneNumber"] = ["Phone number is required."];

        return errors;
    }
}
