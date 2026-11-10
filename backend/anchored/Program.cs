using System.Text.Json.Serialization;
using anchored;
using anchored.Data;
using anchored.Endpoints.Admin;
using anchored.Endpoints.Auth;
using anchored.Endpoints.Patient;
using anchored.Hubs;
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


    builder.Services.AddSignalR()
        .AddJsonProtocol(o => o.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter()));;
    builder.Services.AddHealthChecks();
    builder.Services.AddProblemDetails();
    builder.Services.ConfigureHttpJsonOptions(o =>
    {
        o.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });


    //Features:
    builder.Services.AddAuthFeature();
    builder.Services.AddChatFeature();
    builder.Services.AddRedFlagsFeature();

    var app = builder.Build();

    app.UseSerilogRequestLogging();

    app.UseExceptionHandler(); // unhandled exceptions -> 500 ProblemDetails
    app.UseAuthentication();
    app.UseAuthorization();

    if (app.Environment.IsDevelopment())
    {
        await app.MigrateAndSeedAsync();
    }

    // Endpoints:
    var api = app.MapGroup("/api");
    api.MapAuthEndpoints();
    api.MapPatientEndpoints();
    api.MapAdminEndpoints();

    app.MapHub<ChatHub>("/hubs/chat");
    app.MapHealthChecks("/health").ShortCircuit();

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
