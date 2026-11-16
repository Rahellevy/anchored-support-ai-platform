using System.Security.Claims;
using anchored.Data;
using anchored.DTOs.Therapist;
using anchored.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Serilog;
using ILogger = Serilog.ILogger;

namespace anchored.Endpoints.Therapist;

/// <summary>
/// Read-only therapist access to assigned patients and their saved AI conversations.
///
/// Isolation rule: a therapist may only see a patient whose
/// PatientProfile.AssignedTherapistId equals the caller's own user id. The id always comes
/// from the auth cookie, never from the URL. Any patient or conversation that is not
/// assigned to the caller returns 404, so ids cannot be probed to learn what exists.
/// </summary>
public static class TherapistEndpoints
{
    private static readonly ILogger s_log = Log.ForContext(typeof(TherapistEndpoints));

    public static RouteGroupBuilder MapTherapistEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/therapists")
            .WithTags("Therapists")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Therapist));

        group.MapGet("/me/patients", GetMyPatients);
        group.MapGet("/patients/{patientId}/conversations", GetPatientConversations);
        group.MapGet("/patients/{patientId}/conversations/{conversationId:guid}", GetPatientConversation);

        return api;
    }

    private static async Task<Results<Ok<List<TherapistPatientResponse>>, UnauthorizedHttpResult>> GetMyPatients(
        AppDbContext db, ClaimsPrincipal user)
    {
        var therapistId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (therapistId is null) return TypedResults.Unauthorized();

        var rows = await db.PatientProfiles
            .AsNoTracking()
            .Where(p => p.AssignedTherapistId == therapistId)
            .OrderBy(p => p.User.LastName).ThenBy(p => p.User.FirstName)
            .Select(p => new
            {
                p.UserId,
                p.User.FirstName,
                p.User.LastName,
                p.User.Email,
                ConversationCount = db.Conversations.Count(c => c.PatientId == p.UserId),
                LastMessageAt = db.Conversations
                    .Where(c => c.PatientId == p.UserId)
                    .Max(c => (DateTimeOffset?)c.LastMessageAt)
            })
            .ToListAsync();

        var result = rows
            .Select(r => new TherapistPatientResponse(
                r.UserId,
                r.FirstName,
                r.LastName,
                $"{r.FirstName} {r.LastName}",
                r.Email ?? string.Empty,
                r.ConversationCount,
                r.LastMessageAt))
            .ToList();

        s_log.Information("Therapist {TherapistId} listed {Count} assigned patients", therapistId, result.Count);
        return TypedResults.Ok(result);
    }

    private static async Task<Results<Ok<List<TherapistConversationSummary>>, NotFound, UnauthorizedHttpResult>>
        GetPatientConversations(string patientId, AppDbContext db, ClaimsPrincipal user)
    {
        var therapistId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (therapistId is null) return TypedResults.Unauthorized();

        if (!await IsAssignedAsync(db, therapistId, patientId))
        {
            s_log.Warning("Therapist {TherapistId} denied access to conversations of unassigned patient {PatientId}",
                therapistId, patientId);
            return TypedResults.NotFound();
        }

        var conversations = await db.Conversations
            .AsNoTracking()
            .Where(c => c.PatientId == patientId)
            .OrderByDescending(c => c.LastMessageAt)
            .Select(c => new TherapistConversationSummary(
                c.Id, c.PatientId, c.StartedAt, c.LastMessageAt, c.Messages.Count))
            .ToListAsync();

        s_log.Information("Therapist {TherapistId} listed conversations for patient {PatientId}", therapistId, patientId);
        return TypedResults.Ok(conversations);
    }

    private static async Task<Results<Ok<TherapistConversationDetail>, NotFound, UnauthorizedHttpResult>>
        GetPatientConversation(string patientId, Guid conversationId, AppDbContext db, ClaimsPrincipal user)
    {
        var therapistId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (therapistId is null) return TypedResults.Unauthorized();

        // Ownership is part of the query itself: the conversation must belong to the patient in the URL,
        // and that patient must be assigned to the caller. No match -> 404.
        var conversation = await db.Conversations
            .AsNoTracking()
            .Include(c => c.Messages)
            .Where(c => c.Id == conversationId
                        && c.PatientId == patientId
                        && db.PatientProfiles.Any(p => p.UserId == c.PatientId
                                                       && p.AssignedTherapistId == therapistId))
            .SingleOrDefaultAsync();

        if (conversation is null)
        {
            s_log.Warning(
                "Therapist {TherapistId} denied access to conversation {ConversationId} (patient {PatientId})",
                therapistId, conversationId, patientId);
            return TypedResults.NotFound();
        }

        // Audit trail records who looked at what, never the message content.
        s_log.Information("Therapist {TherapistId} viewed conversation {ConversationId} of patient {PatientId}",
            therapistId, conversationId, patientId);

        var messages = conversation.Messages
            .OrderBy(m => m.SentAt)
            .Select(MessageDto.From)
            .ToList();

        return TypedResults.Ok(new TherapistConversationDetail(
            conversation.Id, conversation.PatientId, conversation.StartedAt, conversation.LastMessageAt, messages));
    }

    private static Task<bool> IsAssignedAsync(AppDbContext db, string therapistId, string patientId) =>
        db.PatientProfiles
            .AsNoTracking()
            .AnyAsync(p => p.UserId == patientId && p.AssignedTherapistId == therapistId);
}
