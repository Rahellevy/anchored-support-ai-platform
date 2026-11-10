namespace anchored.DTOs;

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
        
        