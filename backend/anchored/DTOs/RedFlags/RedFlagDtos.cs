using System.ComponentModel.DataAnnotations;
using anchored.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using MatchType = anchored.Models.MatchType;

namespace anchored.DTOs.RedFlags;

public record RedFlagRuleResponse(
    int Id,
    string Pattern,
    MatchType MatchType,
    Severity Severity,
    bool Enabled,
    DateTimeOffset CreatedAt
)
{
    public static RedFlagRuleResponse From(RedFlagRule r) =>
        new(r.Id, r.Pattern, r.MatchType, r.Severity, r.Enabled, r.CreatedAt);
}


public record CreateRedFlagRequest(
    [Required]
    [MaxLength(500)]
    string Pattern,
    
    [JsonConverter(typeof(StringEnumConverter))]
    MatchType MatchType,
    
    [JsonConverter(typeof(StringEnumConverter))]
    Severity Severity
    );


public record UpdatedRedFlagRequest(
    [Required] [MaxLength(500)] string Pattern,

    [JsonConverter(typeof(StringEnumConverter))]
    MatchType MatchType,

    [JsonConverter(typeof(StringEnumConverter))]
    Severity Severity,

    bool Enabled
);
    
public record RedFlagMatch(
    int RuleId,
    string Pattern,
    Severity Severity,
    string? Reason = null
    );