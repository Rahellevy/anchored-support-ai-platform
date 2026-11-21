using System.Security.Claims;
using anchored.Data;
using anchored.DTOs;
using anchored.DTOs.RedFlags;
using anchored.Helpers;
using anchored.Models;
using anchored.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MatchType = anchored.Models.MatchType;

namespace anchored.Endpoints.Admin;

public static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/admins")
            .WithTags("Admins")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Admin));

        // Users
        group.MapGet("/users", GetUsers);
        group.MapPut("/patients/{patientId}/therapist", AssignTherapist);
        
        // Red-flag-rules
        group.MapGet("/red-flag-rules", GetAll);
        group.MapGet("/red-flag-rules/{id:int}", GetById);
        group.MapPost("/red-flag-rules", Create);
        group.MapPut("/red-flag-rules/{id:int}", Update);
        group.MapDelete("/red-flag-rules/{id:int}", Delete);
        
        // Knowledge Base
        group.MapGet("/kb", GetKbDocuments);
        group.MapGet("/kb/{id:int}", GetKbDocumentById);
        group.MapGet("/kb/{id:int}/file", DownloadKbDocument);
        group.MapPost("/kb", UploadKbDocument).DisableAntiforgery();
        group.MapPatch("/kb/{id:int}", UpdateKbDocument);
        group.MapPost("/kb/{id:int}/reprocess", ReprocessKbDocument);
        group.MapDelete("/kb/{id:int}", DeleteKbDocument);
        
        // Monitoring
        group.MapGet("/monitoring", GetMonitoringSummary);

        return api;
    }

    public static async Task<Results<Ok<List<ManagedUserResponse>>, BadRequest>> GetUsers(AppDbContext db)
    {
        var rawUsers = await db.Users
            .Select(u => new
            {
                u.Id,
                FullName = u.FirstName + " " + u.LastName,
                HasPatient = u.PatientProfile != null,
                HasTherapist = u.TherapistProfile != null,
                HasAdmin = u.AdminProfile != null,
                AssignedTherapistId = u.PatientProfile != null ? u.PatientProfile.AssignedTherapistId : null,
                Disclosure = u.PatientProfile == null 
                    ? "Not Required"
                    : (u.PatientProfile.FirstChatDisclosureAck != null && u.PatientProfile.FirstUseDisclosureAck != null) 
                        ? "Acknowledged" : "Pending"
            })
            .ToListAsync();
        
        var managedUsers = rawUsers.Select(u => new ManagedUserResponse(
            u.Id,
            u.FullName,
            (u.HasPatient, u.HasTherapist, u.HasAdmin) switch
            {
                (true, _, _) => Role.Patient,
                (_, true, _) => Role.Therapist,
                (_, _, true) => Role.Admin,
                _ => throw new InvalidOperationException($"User {u.Id} has no assigned role.")
            },
            u.AssignedTherapistId,
            u.Disclosure,
            AccountStatus.Active
            )).ToList();

        return TypedResults.Ok(managedUsers);
    }

    // Body: { "therapistId": "..." } to assign, { "therapistId": null } to unassign.
    // Returns 204: serializing the PatientProfile entity would loop through its navigation properties.
    public static async Task<Results<NoContent, NotFound<string>>> AssignTherapist(string patientId,
        AssignTherapistRequest request, AppDbContext db)
    {
        var patient = await db.PatientProfiles.SingleOrDefaultAsync(p => p.UserId == patientId);
        if (patient is null)
        {
            return TypedResults.NotFound($"Unable to find Patient with id {patientId}");
        }

        if (request.TherapistId is not null && !await db.TherapistProfiles.AnyAsync(t => t.UserId == request.TherapistId))
        {
            return TypedResults.NotFound($"Unable to find Therapist with id {request.TherapistId}");
        }

        patient.AssignedTherapistId = request.TherapistId;
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    public static async Task<Ok<List<RedFlagRuleResponse>>> GetAll(AppDbContext db) =>
        TypedResults.Ok(await db.RedFlagRules
            .AsNoTracking()
            .OrderBy(r => r.CreatedAt)
            .Select(r => new RedFlagRuleResponse(r.Id, r.Name, r.Pattern, r.MatchType, r.Severity, r.Enabled, r.CreatedAt))
            .ToListAsync()
        );

    public static async Task<Results<Ok<RedFlagRuleResponse>, NotFound>> GetById(int id, AppDbContext db) =>
        await db.RedFlagRules.FindAsync(id) is { } rule
            ? TypedResults.Ok(new RedFlagRuleResponse(rule.Id, rule.Name, rule.Pattern, rule.MatchType, rule.Severity, rule.Enabled, rule.CreatedAt))
            : TypedResults.NotFound();

    public static async Task<Results<Created<RedFlagRuleResponse>, ValidationProblem>> Create(
        CreateRedFlagRequest request, AppDbContext db)
    {
        var matchType = request.MatchType;
        if (RedFlagMatcher.Validate(request.Pattern, matchType) is { } error)
        {
            return ValidationError("pattern", error);
        }

        var rule = new RedFlagRule
        {
            Name = request.Name,
            Pattern = request.Pattern,
            MatchType = request.MatchType,
            Severity = request.Severity
        };

        db.RedFlagRules.Add(rule);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/api/admins/red-flag-rule/{rule.Id}", RedFlagRuleResponse.From(rule));
    }

    public static async Task<Results<Ok<RedFlagRuleResponse>, NotFound, ValidationProblem>> Update(int id,
        UpdatedRedFlagRequest request, AppDbContext db)
    {
        var matchType = request.MatchType;
        if (RedFlagMatcher.Validate(request.Pattern, matchType) is { } error)
        {
            return ValidationError("pattern", error);
        }

        var rule = await db.RedFlagRules.FindAsync(id);
        if (rule is null)
        {
            return TypedResults.NotFound();
        }

        rule.Name = request.Name;
        rule.Pattern = request.Pattern;
        rule.MatchType = request.MatchType;
        rule.Severity = request.Severity;
        rule.Enabled = request.Enabled;
        await db.SaveChangesAsync();

        return TypedResults.Ok(RedFlagRuleResponse.From(rule));
    }

    public static async Task<Results<NoContent, NotFound>> Delete(int id, AppDbContext db)
    {
        var deleted = await db.RedFlagRules.Where(r => r.Id == id).ExecuteDeleteAsync();
        return deleted == 0 ? TypedResults.NotFound() : TypedResults.NoContent();
    }

    // GET /api/admins/kb?category=Policies&status=Failed
    public static async Task<Results<Ok<List<KbDocumentDto>>, BadRequest>> GetKbDocuments(
        KbCategory? category, KbStatus? status, AppDbContext db, CancellationToken ct
        )
    {
        var kbDocs = await db.KbDocuments
            .Where(d => category == null || d.Category == category)
            .Where(d => status == null || d.Status == status)
            .OrderByDescending(d => d.UploadedAt)
            .Select(d => new KbDocumentDto(
                d.Id, d.Title, d.FileName, d.Category, d.Status, d.Enabled, d.UploadedAt, d.Chunks.Count
            )).ToListAsync(ct);

        return TypedResults.Ok(kbDocs);
    }

    public static async Task<Results<Ok<KbDocumentDto>, NotFound, BadRequest>> GetKbDocumentById(int id, AppDbContext db, CancellationToken ct)
    {
        return await db.KbDocuments
            .Include(d => d.Chunks)
            .SingleOrDefaultAsync(d => d.Id == id, ct) is { } kbDoc
            ? TypedResults.Ok(new KbDocumentDto(
                kbDoc.Id, kbDoc.Title, kbDoc.FileName, kbDoc.Category,
                kbDoc.Status, kbDoc.Enabled, kbDoc.UploadedAt, kbDoc.Chunks.Count))
            : TypedResults.NotFound();
    }
    
    public static async Task<Results<PhysicalFileHttpResult, NotFound>> DownloadKbDocument(int id, AppDbContext db, CancellationToken ct)
    {
        var doc = await db.KbDocuments.FindAsync([id], ct);
        return doc is null || !File.Exists(doc.StoragePath)
            ? TypedResults.NotFound()
            : TypedResults.PhysicalFile(doc.StoragePath, doc.ContentType, doc.FileName);
    }

    public static async Task<Results<Accepted<KbDocumentDto>, ValidationProblem, BadRequest>> UploadKbDocument(
        [FromForm] UploadKbDocumentRequest request, ClaimsPrincipal user, AppDbContext db, KbIngestionQueue queue, 
        IOptions<KbOptions> options, CancellationToken ct
        )
    {
        var ext = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        if (!TextExtractor.SupportedExtensions.Contains(ext))
            return ValidationError("file", $"Allowed types: {string.Join(", ", TextExtractor.SupportedExtensions)}");
        if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length > 200)
            return ValidationError("title", "Title is requires (mac 200 characters).");

        Directory.CreateDirectory(options.Value.StoragePath);
        var storagePath = Path.Combine(options.Value.StoragePath, $"{Guid.NewGuid()}{ext}");
        // Block, not `using var`: the file must be closed before the worker opens it,
        // otherwise File.Create's exclusive lock makes ingestion fail.
        await using (var stream = File.Create(storagePath))
        {
            await request.File.CopyToAsync(stream, ct);
        }

        var doc = new KbDocument
        {
            Title = request.Title.Trim(),
            FileName = Path.GetFileName(request.File.FileName),
            // Browsers often send no type for .md files; the download endpoint needs one
            ContentType = string.IsNullOrWhiteSpace(request.File.ContentType)
                ? "application/octet-stream"
                : request.File.ContentType,
            StoragePath = storagePath,
            Category = request.Category,
            UploadById = user.FindFirstValue(ClaimTypes.NameIdentifier)!,
        };

        db.KbDocuments.Add(doc);
        await db.SaveChangesAsync(ct);
        await queue.EnqueueAsync(doc.Id, ct);

        return TypedResults.Accepted($"/api/admins/kb/{doc.Id}",
            new KbDocumentDto(doc.Id, doc.Title, doc.FileName, doc.Category, doc.Status, doc.Enabled, doc.UploadedAt,
                0));
    }

    public static async Task<Results<Ok, NotFound, BadRequest>> UpdateKbDocument(
        int id, UpdateKbDocumentRequest request, AppDbContext db, CancellationToken ct
    )
    {
        var doc = await db.KbDocuments.FindAsync([id], ct);
        if (doc is null) return TypedResults.NotFound();

        if (request.Title is not null) doc.Title = request.Title;
        if (request.Category is not null) doc.Category = request.Category.Value;
        if (request.Enabled is not null) doc.Enabled = request.Enabled.Value;

        await db.SaveChangesAsync(ct);
        return TypedResults.Ok();
    }

    public static async Task<Results<Ok, NotFound, Conflict<string>>> ReprocessKbDocument(int id, AppDbContext db,
        KbIngestionQueue queue, CancellationToken ct)
    {
        var doc = await db.KbDocuments.FindAsync([id], ct);
        if (doc is null) return TypedResults.NotFound();
        if (doc.Status == KbStatus.Pending) return TypedResults.Conflict("Already queued.");

        doc.Status = KbStatus.Pending;
        await db.SaveChangesAsync(ct);
        await queue.EnqueueAsync(doc.Id, ct);
        return TypedResults.Ok();
    }

    public static async Task<Results<NoContent, NotFound>> DeleteKbDocument(int id, AppDbContext db, CancellationToken ct)
    {
        var doc = await db.KbDocuments.FindAsync([id], ct);
        if (doc is null) return TypedResults.NotFound();

        db.KbDocuments.Remove(doc);
        await db.SaveChangesAsync(ct);
        File.Delete(doc.StoragePath);
        return TypedResults.NoContent();
    }

    public static async Task<Results<Ok<MonitoringSummary>, NoContent>> GetMonitoringSummary(AppDbContext db, IOptions<AiPricingOptions> pricing, CancellationToken ct)
    {
        var today = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero);
        var weekStart = today.AddDays(-6);
        
        var purposeLabels = new Dictionary<AiPurpose, string>
        {
            [AiPurpose.ChatReply] = "Chat replies",
            [AiPurpose.RedFlagCheck] = "Red-flag checks",
            [AiPurpose.Embedding] = "Knowledge base indexing",
        };

        var roles = await db.UserRoles
            .Join(db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name!)
            .GroupBy(name => name)
            .Select(g => new { Role = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Role, x => x.Count, ct);

        var accounts = new AccountsSum(roles.GetValueOrDefault(Roles.Patient), roles.GetValueOrDefault(Roles.Therapist),
            roles.GetValueOrDefault(Roles.Admin));

        var conversations = new ConversationsSum(
            await db.Conversations.CountAsync(c => c.LastMessageAt >= weekStart, ct),
            await db.Messages.CountAsync(m => m.Sender == MessageSender.Patient && m.SentAt >= weekStart, ct)
            );

        var openAlerts = new OpenAlertsSum(
            await db.Alerts.CountAsync(a => a.Status == AlertStatus.Open && a.Severity == Severity.High, ct),
            await db.Alerts.CountAsync(a => a.Status == AlertStatus.Open && a.Severity == Severity.Medium, ct)
            );

        var byPurpose = await db.AiUsages
            .GroupBy(u => u.Purpose)
            .Select(g => new { Purpose = g.Key, Usd = g.Sum(u => u.CostUsd) })
            .ToListAsync(ct);

        var spending = new SpendingSum(byPurpose.Sum(u => u.Usd), pricing.Value.BudgetUsd,
            byPurpose.Select(p => new AiUsagePurpose(purposeLabels[p.Purpose], p.Usd)).ToList());

        var sentAt = await db.Messages
            .Where(m => m.Sender == MessageSender.Patient && m.SentAt >= weekStart)
            .Select(m => m.SentAt)
            .ToListAsync(ct);

        var perDay = Enumerable.Range(0, 7)
            .Select(i => weekStart.AddDays(i))
            .Select(day => new MessagesPerDay(day, sentAt.Count(t => t >= day && t < day.AddDays(1))))
            .ToList();

        var pendingDocs = await db.KbDocuments.CountAsync(d => d.Status == KbStatus.Pending, ct);
        var failedDocs = await db.KbDocuments.CountAsync(d => d.Status == KbStatus.Failed, ct);

        List<ServiceStatus> services =
        [
            new("AI", "Responding", true),
            new("Document processing",
                failedDocs > 0 ? $"{failedDocs} failed" : pendingDocs > 0 ? $"{pendingDocs} in queue" : "Idle",
                failedDocs == 0)
        ];

        var aiRepliesEnabled = true;

        List<NeedsAttention> attention =
        [
            // `To` is a frontend route the page links to, not an API path
            new("Patients without a therapist", await db.PatientProfiles.CountAsync(p => p.AssignedTherapistId == null, ct), "/admin/users"),
            new("Documents that failed processing", failedDocs, "/admin/knowledge-base")
        ];

        if (spending.UsedUsd >= spending.BudgetUsd * 0.8m)
            attention.Add(new("AI spending above 80% of budget", 1, "/admin/monitoring"));

        return TypedResults.Ok(new MonitoringSummary(
            accounts, conversations, openAlerts, spending, perDay, services, aiRepliesEnabled, attention));
    }

    private static ValidationProblem ValidationError(string problem, string message) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            [problem] = [message],
        });
}