using System.Text.Json.Serialization;
using anchored;
using anchored.Data;
using anchored.Endpoints.Auth;
using anchored.Setup;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default"),
        npgsql => npgsql.UseVector()
    );
});

builder.Services.AddDataProtection()
    .SetApplicationName("Anchored Support Services - Clinician AI");

builder.Services.AddSignalR();
builder.Services.AddHealthChecks();
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddAuthFeature();

var app = builder.Build();

// Development POC only: create/apply EF migrations and seed all Identity roles.
// Production deployment should apply reviewed migrations separately.
if (app.Environment.IsDevelopment())
    await app.MigrateAndSeedAsync();

app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();

var api = app.MapGroup("/api");
api.MapAuthEndpoints();

app.Run();
