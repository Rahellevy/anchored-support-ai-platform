using System.Text.Json.Serialization;
using anchored;
using anchored.Data;
using anchored.Endpoints.Admin;
using anchored.Endpoints.Auth;
using anchored.Endpoints.Patient;
using anchored.Endpoints.Therapist;
using anchored.Hubs;
using anchored.Models;
using anchored.Setup;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default"),
        npgsql => npgsql.UseVector()
    );
});

    // Shared infrastructure
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("Default"),
            npsql => npsql.UseVector()
        );
    });

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
