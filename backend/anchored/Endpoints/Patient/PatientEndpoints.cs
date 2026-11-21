using System.Security.Claims;
using anchored.Data;
using anchored.DTOs;
using anchored.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Serilog;
using ILogger = Serilog.ILogger;

namespace anchored.Endpoints.Patient;

public static class ChatEndpoints
{
    private static readonly ILogger s_log = Log.Logger;
    public static RouteGroupBuilder MapPatientEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/patients")
            .WithTags("Patients")
            .RequireAuthorization(p => p.RequireRole(Roles.Patient));
        
        group.MapGet("/conversations/{conversationId:guid}/messages", GetMessages);
        group.MapGet("/conversations/mine", GetConversation);
        group.MapPost("/conversations/", StartConversation);
        group.MapPost("/disclosures/{type}/accept", AcceptDisclosure);
        group.MapGet("/disclosures/{type}", GetDisclosure);
        group.MapGet("me/therapist", GetTherapist);
        
        return api;
    }

    private static async Task<Results<Ok<List<MessageDto>>, NotFound, UnauthorizedHttpResult, BadRequest<string>>> GetMessages(Guid conversationId, AppDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return TypedResults.Unauthorized();
        }

        var patientProfile = await db.PatientProfiles
            .Include(p => p.FirstUseDisclosureAck)
            .Include(p => p.FirstChatDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == userId);

        if (patientProfile is null)
        {
            return TypedResults.BadRequest("Error attempting to find patient profile");
        }

        if (patientProfile.FirstChatDisclosureAck is null || patientProfile.FirstUseDisclosureAck is null)
        {
            return TypedResults.BadRequest("First use and/or first chat disclosure has not been acknowledged");
        }

        var conversation = await db.Conversations
            .Include(c => c.Messages)
            .SingleOrDefaultAsync(c => c.Id == conversationId && c.PatientId == userId);

        if (conversation is null)
        {
            s_log.Warning("No conversation exists yet");
            return TypedResults.NotFound();
        }
        
        return TypedResults.Ok(
            conversation.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageDto(m.Id,  m.ConversationId, m.Sender, m.Content, m.SentAt))
                .ToList()
            );
    }

    private static async Task<Results<Ok<ConversationRef>, UnauthorizedHttpResult, BadRequest<string>>> StartConversation(AppDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return TypedResults.Unauthorized();
        }

        var patientProfile = await db.PatientProfiles
            .Include(p => p.FirstUseDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == userId);

        if (patientProfile is null)
        {
            return TypedResults.BadRequest("Error attempting to find patient profile");
        }

        if (patientProfile.FirstUseDisclosureAck is null)
        {
            return TypedResults.BadRequest("First use disclosure has not been acknowledged");
        }

        var existingConvo = await db.Conversations.FirstOrDefaultAsync(c => c.PatientId == userId);
        if (existingConvo is not null)
        {
            s_log.Information("Conversation already exists with id {Id}", existingConvo.Id);
            return TypedResults.Ok(new ConversationRef(existingConvo.Id));
        }

        var newConversation = new Conversation { PatientId = userId };
        db.Conversations.Add(newConversation);

        try
        {
            await db.SaveChangesAsync();
            s_log.Information("Conversation created with id {Id}", newConversation.Id);
            return TypedResults.Ok(new ConversationRef(newConversation.Id));
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            db.ChangeTracker.Clear();
            var existing = await db.Conversations.FirstAsync(c => c.PatientId == userId);
            return TypedResults.Ok(new ConversationRef(existing.Id));
        }
    }

    private static async Task<Results<Ok<ConversationRef>, UnauthorizedHttpResult, BadRequest<string>, NotFound>> GetConversation(
        AppDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return TypedResults.Unauthorized();
        }

        var patientProfile = await db.PatientProfiles
            .Include(p => p.FirstUseDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == userId);

        if (patientProfile is null)
        {
            return TypedResults.BadRequest("Error attempting to find patient profile");
        }

        if (patientProfile.FirstUseDisclosureAck is null)
        {
            return TypedResults.BadRequest("First use disclosure has not been acknowledged");
        }

        var existingConvo = await db.Conversations.FirstOrDefaultAsync(c => c.PatientId == userId);
        if (existingConvo is not null)
        {
            return TypedResults.Ok(new ConversationRef(existingConvo.Id));
        }
        return TypedResults.NotFound();
    }

    private static async Task<Results<Ok, UnauthorizedHttpResult, BadRequest<string>>> AcceptDisclosure(string type, AppDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return TypedResults.Unauthorized();
        }
        
        var patientProfile = await db.PatientProfiles
            .Include(p => p.FirstUseDisclosureAck)
            .Include(p => p.FirstChatDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == userId);

        if (patientProfile is null)
        {
            return TypedResults.BadRequest("Error attempting to find patient profile");
        }
        
        DisclosureType? disclosureType = (type) switch
        {
            "first-use" => DisclosureType.FirstUse,
            "first-chat" => DisclosureType.FirstChat,
            _ => null
        };

        if (disclosureType is null) return TypedResults.BadRequest($"Unknown disclosure '{type}'");

        if (disclosureType == DisclosureType.FirstUse && patientProfile.FirstUseDisclosureAck is null)
            patientProfile.FirstUseDisclosureAck = new DisclosureAcceptance{ UserId = userId, Type = DisclosureType.FirstUse};
        else if (disclosureType == DisclosureType.FirstChat && patientProfile.FirstChatDisclosureAck is null)
            patientProfile.FirstChatDisclosureAck = new DisclosureAcceptance{ UserId = userId, Type = DisclosureType.FirstChat};

        await db.SaveChangesAsync();
        return TypedResults.Ok();
    }

    private static async Task<Results<Ok<DisclosureStatus>, UnauthorizedHttpResult, BadRequest<string>>> GetDisclosure(string type,
        AppDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return TypedResults.Unauthorized();
        }
        
        var patientProfile = await db.PatientProfiles
            .Include(p => p.FirstUseDisclosureAck)
            .Include(p => p.FirstChatDisclosureAck)
            .SingleOrDefaultAsync(p => p.UserId == userId);

        if (patientProfile is null)
        {
            return TypedResults.BadRequest("Error attempting to find patient profile");
        }

        bool accepted;
        DateTimeOffset? acceptedAt = null;
        DisclosureType disclosureType;
        
        switch (type)
        {
            case "first-use":
            {
                disclosureType = DisclosureType.FirstUse;
                if (patientProfile.FirstUseDisclosureAck is not null)
                {
                    accepted = true;
                    acceptedAt = patientProfile.FirstUseDisclosureAck.AcceptedAt;
                }
                else
                {
                    accepted = false;
                }
                break;
            }

            case "first-chat":
            {
                disclosureType = DisclosureType.FirstChat;
                if (patientProfile.FirstChatDisclosureAck is not null)
                {
                    accepted = true;
                    acceptedAt = patientProfile.FirstChatDisclosureAck.AcceptedAt;
                }
                else
                {
                    accepted = false;
                }
                break;
            }

            default:
                throw new Exception($"{type} is not a valid disclosure type");
        }

        return TypedResults.Ok(new DisclosureStatus(disclosureType, accepted, acceptedAt));
    }

    private static async Task<Results<Ok<GetTherapistResponse>, BadRequest<string>, NotFound, UnauthorizedHttpResult>> GetTherapist(AppDbContext db, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
        {
            return TypedResults.Unauthorized();
        }
        
        var patientProfile = await db.PatientProfiles
            .Where(p => p.AssignedTherapist != null)
            .Include(p => p.AssignedTherapist!.User)
            .SingleOrDefaultAsync(p => p.UserId == userId);

        if (patientProfile is null)
        {
            return TypedResults.NotFound();
        }

        if (patientProfile.AssignedTherapist is { } therapist)
        {
            var therapistFullname = therapist.User.FirstName + " " + therapist.User.LastName;
            s_log.Information("Therapist {Therapist} found for User with id {Id}", therapistFullname, userId);
            return TypedResults.Ok(new GetTherapistResponse(therapistFullname));
        }
        return TypedResults.NotFound();
    }
}