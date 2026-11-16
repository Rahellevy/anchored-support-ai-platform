using anchored.Models;

namespace anchored.DTOs.Therapist;

/// <summary>One row in the therapist's patient list.</summary>
public sealed record TherapistPatientResponse(
    string Id,
    string FirstName,
    string LastName,
    string Name,
    string Email,
    int ConversationCount,
    DateTimeOffset? LastMessageAt);

/// <summary>Conversation metadata only (no messages) for the history list.</summary>
public sealed record TherapistConversationSummary(
    Guid Id,
    string PatientId,
    DateTimeOffset StartedAt,
    DateTimeOffset LastMessageAt,
    int MessageCount);

/// <summary>A single conversation with its messages in chronological order.</summary>
public sealed record TherapistConversationDetail(
    Guid Id,
    string PatientId,
    DateTimeOffset StartedAt,
    DateTimeOffset LastMessageAt,
    List<MessageDto> Messages);
