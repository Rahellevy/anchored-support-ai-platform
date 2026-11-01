using System.Text.Json.Serialization;
using anchored.Data;
using anchored.Setup;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Shared infrastructure
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default"),
        npsql => npsql.UseVector()
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


//Features:
builder.Services.AddAuthFeature();

var app = builder.Build();

app.UseExceptionHandler(); // unhandled exceptions -> 500 ProblemDetails
app.UseAuthentication();
app.UseAuthorization();


// Endpoints:
var api = app.MapGroup("/api");


app.Run();