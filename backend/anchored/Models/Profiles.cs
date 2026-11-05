using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace anchored.Models;

public class PatientProfile
{
    public string UserId { get; set; } = null!;
    public AppUser User { get; set; } = null!;
    // public DateOnly DateOfBirth { get; set; }
    public string? AssignedTherapistId { get; set; }
    public TherapistProfile? AssignedTherapist { get; set; }
    public bool AckDisclosure { get; set; } = false;
}

public class TherapistProfile
{
    public string UserId { get; set; } = null!;
    public AppUser User { get; set; } = null!;
    public List<PatientProfile>? Patients { get; set; }
}

public class AdminProfile
{
    public string UserId { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}

public class PatientProfileConfiguration : IEntityTypeConfiguration<PatientProfile>
{
    public void Configure(EntityTypeBuilder<PatientProfile> builder)
    {
        builder.ToTable("patient_profiles");
        builder.HasKey(p => p.UserId);
        builder.HasOne(p => p.User)
            .WithOne(u => u.PatientProfile)
            .HasForeignKey<PatientProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);                       // delete user -> delete profile

        builder.HasOne(p => p.AssignedTherapist)
            .WithMany(t => t.Patients)
            .HasForeignKey(p => p.AssignedTherapistId)
            .OnDelete(DeleteBehavior.SetNull);                       // therapist leaves -> patient unassigned
    }
}

public class TherapistProfileConfiguration : IEntityTypeConfiguration<TherapistProfile>
{
    public void Configure(EntityTypeBuilder<TherapistProfile> builder)
    {
        builder.ToTable("therapist_profiles");
        builder.HasKey(t => t.UserId);
        builder.HasOne(t => t.User)
            .WithOne(u => u.TherapistProfile)
            .HasForeignKey<TherapistProfile>(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AdminProfileConfiguration : IEntityTypeConfiguration<AdminProfile>
{
    public void Configure(EntityTypeBuilder<AdminProfile> builder)
    {
        builder.ToTable("admin_profiles");
        builder.HasKey(a => a.UserId);
        builder.HasOne(a => a.User)
            .WithOne(u => u.AdminProfile)
            .HasForeignKey<AdminProfile>(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}



