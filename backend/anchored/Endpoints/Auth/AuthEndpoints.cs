using System.Security.Claims;
using anchored.Data;
using anchored.DTOs.Auth;
using anchored.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace anchored.Endpoints.Auth;

/// <summary>
/// /api/auth/* - 
/// </summary>
public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/auth").WithTags("Auth");

        group.MapPost("/register", Register).AllowAnonymous();
        group.MapPost("/login", Login).AllowAnonymous();
        group.MapPost("logout", Logout).RequireAuthorization();
        group.MapPost("/me", Me).RequireAuthorization();

        return api;
    }

    private static async Task<Results<Created<UserResponse>, ValidationProblem, BadRequest<string>>> Register(
        RegisterRequest registerRequest, 
        UserManager<AppUser> userManager,
        AppDbContext db)
    {
        var newUser = new AppUser
        {
            UserName = registerRequest.Username,
            FirstName = registerRequest.FirstName,
            LastName = registerRequest.LastName,
            Email = registerRequest.Email,
            PhoneNumber = registerRequest.PhoneNumber
        };

        await using var tx = await db.Database.BeginTransactionAsync();

        var created = await userManager.CreateAsync(newUser, registerRequest.Password);
        if (!created.Succeeded)
        {
            return TypedResults.ValidationProblem(ToErrors(created));
        }

        var user = await userManager.FindByEmailAsync(registerRequest.Email);
        if (user is null)
        {
            return TypedResults.BadRequest($"Failed to retrieve user with email: {registerRequest.Email}");
        }
        
        await userManager.AddToRoleAsync(user, Roles.Patient); // Possibly wait for admin approval
        db.PatientProfiles.Add(new PatientProfile
        {
            UserId = user.Id,
            User = user,
            // DateOfBirth = registerRequest.DateOfBirth,
        });

        await db.SaveChangesAsync();
        await tx.CommitAsync();
        
        return TypedResults.Created("/api/auth/me", await ToResponse(user, userManager));
    }

    public static async Task<Results<Ok<UserResponse>, UnauthorizedHttpResult, BadRequest<string>>> Login(
        LoginRequest loginRequest,
        SignInManager<AppUser> signInManager,
        UserManager<AppUser> userManager)
    {
        var loginResult = await signInManager.PasswordSignInAsync(
            loginRequest.Email, loginRequest.Password, false, false);

        if (!loginResult.Succeeded)
        {
            return TypedResults.Unauthorized();
        }

        var user = await userManager.FindByEmailAsync(loginRequest.Email);
        
        if (user is null)
        {
            return TypedResults.BadRequest("Error logging in");
        }
        return TypedResults.Ok(await ToResponse(user, userManager));
    }

    public static async Task<Results<Ok<UserResponse>, UnauthorizedHttpResult>> Me(ClaimsPrincipal claimsPrincipal,
        UserManager<AppUser> userManager)
    {
        var user = await userManager.GetUserAsync(claimsPrincipal);
        return user is null ? TypedResults.Unauthorized() : TypedResults.Ok(await ToResponse(user, userManager));
    }
    
    public static async Task<NoContent> Logout(SignInManager<AppUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return TypedResults.NoContent();
    }

    public static async Task<UserResponse> ToResponse(AppUser user, UserManager<AppUser> userManager) =>
        new(user.Id, user.Email!, user.FirstName, user.LastName, await userManager.GetRolesAsync(user));

    public static Dictionary<string, string[]> ToErrors(IdentityResult result) =>
        result
            .Errors
            .GroupBy(e => e.Code)
            .ToDictionary(g => g.Key, g => g.Select(e => e.Description)
                .ToArray());
}
