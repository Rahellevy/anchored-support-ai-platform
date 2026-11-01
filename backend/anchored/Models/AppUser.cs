using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace anchored.Models;

public class AppUser : IdentityUser
{
    [MaxLength(50)]
    public string FirstName { get; set; } = null!;
    
    [MaxLength(50)]
    public string LastName { get; set; } = null!;
    
    public PatientProfile? PatientProfile { get; set; }
    public TherapistProfile? TherapistProfile { get; set; }
    public AdminProfile? AdminProfile { get; set; }
}

public static class Roles
{
    public const string Patient = "Patient";
    public const string Therapist = "Therapist";
    public const string Admin = "Admin";

    public static readonly string[] All = [Patient, Therapist, Admin];
}