using System.Security.Claims;
using anchored.Data;
using anchored.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace anchored.Endpoints.Patient;

public static class ChatEndpoints
{
    public static RouteGroupBuilder MapChatEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/patient").WithTags("Patients").RequireAuthorization(p => p.RequireRole(Roles.Patient));
        group.MapGet("/conversations/messages", GetMessages);
        group.MapPost("/conversations/", StartConversation);
        group.MapPost("/disclosures/first-use/accept", AcceptFirstUseDisclosure);
        group.MapPost("/disclosures/first-chat/accept", AcceptFirstChatDisclosure);
        
        return api;
    }

    private static async Task<Results<Ok<List<Message>>, UnauthorizedHttpResult, BadRequest<string>>> GetMessages(AppDbContext db, ClaimsPrincipal claimsPrincipal, UserManager<AppUser> userManager)
    {
        var user = await userManager.GetUserAsync(claimsPrincipal);
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }

        var patientProfile = await db.PatientProfiles
            .Include(p => p.FirstUseDisclosureAck)
            .Include(p => p.FirstChatDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == user.Id);

        if (patientProfile is null)
        {
            return TypedResults.BadRequest("Error attempting to find patient profile");
        }

        if (patientProfile.FirstChatDisclosureAck is null || patientProfile.FirstUseDisclosureAck is null)
        {
            return TypedResults.BadRequest("First use and/or first chat disclosure has not been acknowledged");
        }

        var conversation = await db.Conversations.Include(c => c.Messages).SingleOrDefaultAsync(c => c.PatientId == user.Id);

        if (conversation is null)
        {
            return TypedResults.BadRequest("Could not find conversation");
        }

        return TypedResults.Ok(conversation.Messages);
    }

    private static async Task<Results<Ok<Guid>, UnauthorizedHttpResult, BadRequest<string>>> StartConversation(AppDbContext db, ClaimsPrincipal claimsPrincipal, UserManager<AppUser> userManager)
    {
        var user = await userManager.GetUserAsync(claimsPrincipal);
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }

        var patientProfile = await db.PatientProfiles
            .Include(p => p.FirstUseDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == user.Id);

        if (patientProfile is null)
        {
            return TypedResults.BadRequest("Error attempting to find patient profile");
        }

        if (patientProfile.FirstUseDisclosureAck is null)
        {
            return TypedResults.BadRequest("First use disclosure has not been acknowledged");
        }

        var existingConvo = await db.Conversations.FirstOrDefaultAsync(c => c.PatientId == user.Id);
        if (existingConvo is not null) return TypedResults.Ok(existingConvo.Id);

        var newConversation = new Conversation { PatientId = user.Id, Patient = user};
        db.Conversations.Add(newConversation);

        try
        {
            await db.SaveChangesAsync();
            return TypedResults.Ok(newConversation.Id);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            db.ChangeTracker.Clear();
            var existing = await db.Conversations.FirstAsync(c => c.PatientId == user.Id);
            return TypedResults.Ok(existing.Id);
        }
    }

    private static async Task<Results<Ok, UnauthorizedHttpResult, BadRequest<string>>> AcceptFirstUseDisclosure(AppDbContext db, ClaimsPrincipal claimsPrincipal, UserManager<AppUser> userManager)
    {
        var user = await userManager.GetUserAsync(claimsPrincipal);
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }
        
        var patientProfile = await db.PatientProfiles
            .Include(p => p.FirstUseDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == user.Id);

        if (patientProfile is null)
        {
            return TypedResults.BadRequest("Error attempting to find patient profile");
        }

        if (patientProfile.FirstUseDisclosureAck is not null)
        {
            return TypedResults.Ok();
        }

        patientProfile.FirstUseDisclosureAck = new DisclosureAcceptance{ Type = DisclosureType.FirstUse};
        db.PatientProfiles.Update(patientProfile);

        try
        {
            await db.SaveChangesAsync();
            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            throw new Exception("Failed to accept disclosure");
        }
    }
    
    private static async Task<Results<Ok, UnauthorizedHttpResult, BadRequest<string>>> AcceptFirstChatDisclosure(AppDbContext db, ClaimsPrincipal claimsPrincipal, UserManager<AppUser> userManager)
    {
        var user = await userManager.GetUserAsync(claimsPrincipal);
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }
        
        var patientProfile = await db.PatientProfiles
            .Include(p => p.FirstChatDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == user.Id);

        if (patientProfile is null)
        {
            return TypedResults.BadRequest("Error attempting to find patient profile");
        }

        if (patientProfile.FirstChatDisclosureAck is not null)
        {
            return TypedResults.Ok();
        }

        patientProfile.FirstChatDisclosureAck = new DisclosureAcceptance{ Type = DisclosureType.FirstChat};
        db.PatientProfiles.Update(patientProfile);

        try
        {
            await db.SaveChangesAsync();
            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            throw new Exception("Failed to accept disclosure");
        }
    }
}