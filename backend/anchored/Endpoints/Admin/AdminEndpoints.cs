using anchored.Data;
using anchored.DTOs.RedFlags;
using anchored.Models;
using anchored.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using MatchType = anchored.Models.MatchType;

namespace anchored.Endpoints.Admin;

public static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/admins")
            .WithTags("Admins")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Admin));

        group.MapGet("/red-flags", GetAll);
        group.MapGet("/red-flags/{id:int}", GetById);
        group.MapPost("/red-flags", Create);
        group.MapPut("/red-flags/{id:int}", Update);
        group.MapDelete("/red-flags/{id:int}", Delete);

        return api;
    }

    public static async Task<Ok<List<RedFlagRuleResponse>>> GetAll(AppDbContext db) =>
        TypedResults.Ok(await db.RedFlagRules
            .AsNoTracking()
            .OrderBy(r => r.CreatedAt)
            .Select(r => new RedFlagRuleResponse(r.Id, r.Pattern, r.MatchType, r.Severity, r.Enabled, r.CreatedAt))
            .ToListAsync()
        );

    public static async Task<Results<Ok<RedFlagRuleResponse>, NotFound>> GetById(int id, AppDbContext db) =>
        await db.RedFlagRules.FindAsync(id) is { } rule
            ? TypedResults.Ok(new RedFlagRuleResponse(rule.Id, rule.Pattern, rule.MatchType, rule.Severity, rule.Enabled, rule.CreatedAt))
            : TypedResults.NotFound();

    public static async Task<Results<Created<RedFlagRuleResponse>, ValidationProblem>> Create(
        CreateRedFlagRequest request, AppDbContext db)
    {
        var matchType = request.MatchType;
        if (RedFlagMatcher.Validate(request.Pattern, matchType) is { } error)
        {
            return PatternError(error);
        }

        var rule = new RedFlagRule
        {
            Pattern = request.Pattern,
            MatchType = request.MatchType,
            Severity = request.Severity
        };

        db.RedFlagRules.Add(rule);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/api/admins/red-flags/{rule.Id}", RedFlagRuleResponse.From(rule));
    }

    public static async Task<Results<Ok<RedFlagRuleResponse>, NotFound, ValidationProblem>> Update(int id,
        UpdatedRedFlagRequest request, AppDbContext db)
    {
        var matchType = request.MatchType;
        if (RedFlagMatcher.Validate(request.Pattern, matchType) is { } error)
        {
            return PatternError(error);
        }

        var rule = await db.RedFlagRules.FindAsync(id);
        if (rule is null)
        {
            return TypedResults.NotFound();
        }

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

    private static ValidationProblem PatternError(string message) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            ["pattern"] = [message],
        });
}