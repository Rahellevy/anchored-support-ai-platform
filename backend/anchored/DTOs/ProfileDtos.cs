using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace anchored.DTOs;

public enum Role
{
    Patient,
    Therapist,
    Admin
}

public enum AccountStatus
{
    Active,
    Inactive
}

public record PatientProfileResponse(
    string UserId,
    string? TherapistId,
    DateTimeOffset? FirstUseDisclosureAcceptedAt,
    DateTimeOffset? FirstChatDisclosureAcceptedAt
    );
    
public record TherapistProfileResponse(
    string UserId,
    List<PatientProfileResponse> Patients
    );

public record GetTherapistResponse(
    string Name);


// Therapist DTOs
public record PatientSummaryDto(
    string Id,
    string Name,
    DateTimeOffset? LastMessageAt,
    int MessagesLast7Days,
    int HighFlags,
    int MedFlags,
    bool NeedsReview,
    DateTimeOffset? LastReviewedAt,
    Guid? ConversationId
);


// Admin DTOs
/// <summary>Body of PUT /api/admins/patients/{patientId}/therapist. Null unassigns.</summary>
public record AssignTherapistRequest(string? TherapistId);

public record ManagedUserResponse(
    string Id,
    string Name,
    [JsonConverter(typeof(StringEnumConverter))]
    Role Role,
    string? TherapistId,
    string Disclosure,
    [JsonConverter(typeof(StringEnumConverter))]
    AccountStatus Status
    );
        