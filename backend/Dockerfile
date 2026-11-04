# Buld stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Restore first so the NuGet layer is cached between code-only changes
COPY anchored/anchored.csproj anchored/
RUN dotnet restore anchored/anchored.csproj
COPY anchored/ anchored/
RUN dotnet publish anchored/anchored.csproj -c Release -o /app --no-restore

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "anchored.dll"]