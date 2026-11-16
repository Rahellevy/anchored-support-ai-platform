namespace anchored.DTOs.Admin;

// Shapes used by the Admin Users page. Passwords are never returned to the browser.
public sealed record ManagedUserResponse(
    string Id,
    string Name,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    string? TherapistId,
    string Disclosure,
    string AccountStatus);

public sealed record CreateManagedUserRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string Role);

public sealed record UpdateManagedUserRequest(
    string FirstName,
    string LastName,
    string Email);

// Null removes the assignment. Only existing therapist accounts are accepted.
public sealed record AssignTherapistRequest(string? TherapistId);
