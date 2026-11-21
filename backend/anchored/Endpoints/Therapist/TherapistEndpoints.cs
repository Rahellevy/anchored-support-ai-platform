using System.Security.Claims;
using anchored.Data;
using anchored.DTOs;
using anchored.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using MatchType = anchored.Models.MatchType;

namespace anchored.Endpoints.Therapist;

public static class TherapistEndpoints
{
    public static RouteGroupBuilder MapTherapistEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/therapists")
            .WithTags("Therapists")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Therapist));

        group.MapGet("/me/patients", GetMyPatients);
        group.MapGet("/alerts", GetAlerts);
        // Route parameter names must match the handler parameter names, or minimal APIs try to bind
        // them from the query string instead and every request fails with 400.
        group.MapPost("/alerts/{alertId:guid}/acknowledge", AcknowledgeAlert);
        group.MapGet("/conversations/{conversationId:guid}", GetConversation);
        group.MapPost("/conversations/{conversationId:guid}/review", MarkConversationReviewed);

        return api;
    }

    public static async Task<Results<Ok<List<PatientSummaryDto>>, NotFound, BadRequest>> GetMyPatients(ClaimsPrincipal user, AppDbContext db, CancellationToken ct)
    {
        var therapistId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (therapistId is null) return TypedResults.NotFound();

        var weekAgo = DateTimeOffset.UtcNow.AddDays(-7);

        var patients = await db.PatientProfiles
            .Where(p => p.AssignedTherapistId == therapistId)
            .Select(p => new
            {
                p.UserId,
                Name = p.User.FirstName + " " + p.User.LastName,
                Convo = db.Conversations.Where(c => c.PatientId == p.UserId)
                    .Select(c => new { c.Id, c.LastMessageAt, c.LastReviewedAt }).FirstOrDefault(),
                Messages = db.Messages.Count(m => m.Conversation.PatientId == p.UserId
                    && m.Sender == MessageSender.Patient && m.SentAt >= weekAgo),
                // Open alerts only, so a patient's flag badges clear once the therapist acknowledges them
                High = db.Alerts.Count(a => a.PatientId == p.UserId && a.Status == AlertStatus.Open && a.Severity == Severity.High),
                Medium = db.Alerts.Count(a => a.PatientId == p.UserId && a.Status == AlertStatus.Open && a.Severity == Severity.Medium)
            }).Select(p => new PatientSummaryDto(
                p.UserId,
                p.Name,
                p.Convo == null ? null : p.Convo.LastMessageAt,
                p.Messages,
                p.High,
                p.Medium,
                p.Convo != null && (p.Convo.LastReviewedAt == null || p.Convo.LastReviewedAt < p.Convo.LastMessageAt),
                p.Convo == null ? null : p.Convo.LastReviewedAt,
                p.Convo == null ? null : p.Convo.Id
            )).ToListAsync(ct);

        return TypedResults.Ok(patients);
    }

    public static async Task<Results<Ok<List<AlertDto>>, NoContent, NotFound>> GetAlerts(ClaimsPrincipal user, AppDbContext db, CancellationToken ct)
    {
        var therapistId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (therapistId is null) return TypedResults.NotFound();

        var alerts = await db.Alerts.Where(a => a.Patient.AssignedTherapistId == therapistId)
            .OrderByDescending(a => a.RaisedAt)
            .Select(a => new AlertDto(
                a.Id, a.PatientId, a.Patient.User.FirstName + " " + a.Patient.User.LastName,
                a.ConversationId, a.MessageId, a.RuleId, a.RuleName, a.MatchType, a.Severity, a.Reason,
                a.Message.Content, a.RelatedMessages, a.Status, a.RaisedAt, a.AcknowledgedAt
            )).ToListAsync(ct);

        return TypedResults.Ok(alerts);
    }

    public static async Task<Results<Ok, NotFound>> AcknowledgeAlert(Guid alertId, ClaimsPrincipal user, AppDbContext db, CancellationToken ct)
    {
        var therapistId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (therapistId is null) return TypedResults.NotFound();

        var alert = await db.Alerts.SingleOrDefaultAsync(
            a => a.Id == alertId && a.Patient.AssignedTherapistId == therapistId, ct);
        if (alert is null) return TypedResults.NotFound();

        alert.Status = AlertStatus.Acknowledged;
        alert.AcknowledgedAt ??= DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        return TypedResults.Ok();
    }

    public static async Task<Results<Ok<ConversationDetailDto>, NotFound>> GetConversation(Guid conversationId, ClaimsPrincipal user, AppDbContext db, CancellationToken ct)
    {
        var therapistId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (therapistId is null) return TypedResults.NotFound();

        var conversation = await db.Conversations
            .Where(c => c.Id == conversationId &&
                        db.PatientProfiles.Any(p => p.UserId == c.PatientId && p.AssignedTherapistId == therapistId))
            .Select(c => new ConversationDetailDto(c.Id, c.PatientId, c.Patient.FirstName + " " + c.Patient.LastName,
                c.Messages.OrderBy(m => m.SentAt)
                    .Select(m => new MessageDto(m.Id, m.ConversationId, m.Sender, m.Content, m.SentAt)).ToList(),
                c.LastReviewedAt != null && c.LastReviewedAt >= c.LastMessageAt, "")).SingleOrDefaultAsync(ct);

        return conversation is null ? TypedResults.NotFound() : TypedResults.Ok(conversation);
    }

    public static async Task<Results<Ok, NotFound>> MarkConversationReviewed(Guid conversationId, ClaimsPrincipal user, AppDbContext db,
        CancellationToken ct)
    {
        var therapistId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (therapistId is null) return TypedResults.NotFound();

        var conversation = await db.Conversations.SingleOrDefaultAsync(c => c.Id == conversationId
            && db.PatientProfiles.Any(p => p.UserId == c.PatientId && p.AssignedTherapistId == therapistId), ct);
        if (conversation is null) return TypedResults.NotFound();

        conversation.LastReviewedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok();
    }
}