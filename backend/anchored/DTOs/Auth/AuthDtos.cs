using System.ComponentModel.DataAnnotations;

namespace anchored.DTOs.Auth;

public record LoginRequest(
    [Required]
    [EmailAddress]
    string Email,

    [Required]
    string Password
);

public record RegisterRequest(
    [Required]
    string FirstName,

    [Required]
    string LastName,

    [Required]
    string Username,

    [Required]
    [MinLength(8)]
    string Password,

    [Required]
    [EmailAddress]
    string Email,

    [Required]
    string PhoneNumber // Verify if this should be included
    
    // [Required]
    // DateOnly DateOfBirth,
);

public record UserResponse(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    IList<string> Roles
);