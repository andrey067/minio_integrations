# Multi-stage build for MinIO .NET Application
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Install build dependencies
RUN apk add --no-cache python3 py3-pip git && \
    pip3 install --break-system-packages pre-commit detect-secrets

# Copy project files
COPY ["src/MinioDotnet/MinioDotnet.csproj", "src/MinioDotnet/"]
COPY ["src/MinioDotnet.Services/MinioDotnet.Services.csproj", "src/MinioDotnet.Services/"]
COPY [".config/dotnet-tools.json", ".config/"]
COPY ["MinioDotnet.sln", "./"]

# Restore dependencies
RUN dotnet restore "src/MinioDotnet/MinioDotnet.csproj"

# Copy source code
COPY . .

# Restore tools and run quality checks
RUN dotnet tool restore && \
    dotnet csharpier check . && \
    echo "Code formatting check passed"

# Build application
WORKDIR "/src/src/MinioDotnet"
RUN dotnet build "MinioDotnet.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MinioDotnet.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

# Copy published application
COPY --from=publish /app/publish .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "MinioDotnet.dll"]
