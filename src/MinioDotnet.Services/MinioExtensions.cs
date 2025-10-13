using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;

namespace MinioDotnet.Services;

public static class MinioExtensions
{
    public static void MinioConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        var endpoint = configuration["Minio:Endpoint"];
        var port = int.Parse(configuration["Minio:Port"]!);
        var accessKey = configuration["Minio:AccessKey"];
        var secretKey = configuration["Minio:SecretKey"];

        services.AddMinio(configureClient => configureClient
                .WithEndpoint(endpoint, port)
                .WithCredentials(accessKey, secretKey)
                .WithSSL(false)
                .Build());
    }
}
