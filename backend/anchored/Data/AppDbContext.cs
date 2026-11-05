using anchored.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace anchored.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<PatientProfile> PatientProfiles => Set<PatientProfile>();
    public DbSet<TherapistProfile> TherapistProfiles => Set<TherapistProfile>();
    public DbSet<AdminProfile> AdminProfiles => Set<AdminProfile>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // builds the Identity tables
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasPostgresExtension("vector");

        // Picks up every IEntityTypeConfiguration<T> in the project
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
