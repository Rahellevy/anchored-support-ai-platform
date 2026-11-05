using System.Text.Json.Serialization;
using anchored;
using anchored.Data;
using anchored.Endpoints.Auth;
using anchored.Setup;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Setup Logger
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/anchored-log-.txt", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateLogger();

try
{
    Log.Information("Starting Anchored Clinician AI app...");
    
    // Redirect standard .NET internal logs through Serilog
    builder.Host.UseSerilog();

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

    app.UseSerilogRequestLogging();

    app.UseExceptionHandler(); // unhandled exceptions -> 500 ProblemDetails
    app.UseAuthentication();
    app.UseAuthorization();

    await app.MigrateAndSeedAsync();

    // Endpoints:
    var api = app.MapGroup("/api");
    api.MapAuthEndpoints();

    app.Run();
    
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Error(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
