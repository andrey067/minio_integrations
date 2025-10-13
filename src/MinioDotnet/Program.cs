using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Interfaces;
using MinioDotnet.Services;
using MinioDotnet.Services.Interfaces;
using MinioDotnet.Services.Services;
using System.IO.Compression;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<IMinioServices, MinioServices>();
builder.Services.MinioConfiguration(builder.Configuration);

builder.Services.AddSwaggerGen(options =>
{

    options.SwaggerDoc("v1",
       new Microsoft.OpenApi.Models.OpenApiInfo
       {
           Title = "API de MinIO",
           Version = "v1",
           Description = "Esta API oferece operações de gerenciamento de buckets no MinIO, incluindo criação, listagem, exclusão e upload/download de arquivos.",
           Contact = new Microsoft.OpenApi.Models.OpenApiContact()
           {
               Name = "Audrey Ernesto de Lima",
               Email = "audrey.ernesto.lima@gmail.com",
           },
           Extensions = new Dictionary<string, IOpenApiExtension>
           {
                {"x-logo", new OpenApiObject
                    {
                        {"url", new OpenApiString("https://foforks.com.br/wp-content/uploads/2019/05/news.jpeg")},
                        { "altText", new OpenApiString("News")}
                    }
                }
           }
       });
});

var app = builder.Build();

app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "Minio V1"));


app.MapPost("/create-bucket", async (IMinioServices minioServices, [FromBody] string bucketName) =>
{
    await minioServices.CreateBucket(bucketName);
    return Results.Created();
});

app.MapGet("/list-buckets", async (IMinioServices minioServices) =>
{
    var buckets = await minioServices.ListBuckets();
    return Results.Ok(buckets);
});

app.MapDelete("/delete-bucket/{bucketName}", async (IMinioServices minioServices, string bucketName) =>
{
    await minioServices.DeleteBucket(bucketName);
    return Results.NoContent();
});

app.MapPost("/upload", async (IMinioServices minioServices, [FromForm] IFormFile file, [FromQuery] string bucketName) =>
{
    using var stream = file.OpenReadStream();
    await minioServices.UploadFileAsync(bucketName, file.FileName, stream, file.ContentType);
    return Results.Ok(new { file.FileName });
}).DisableAntiforgery();

app.MapGet("/download/{bucketName}/{fileName}", async (IMinioServices minioServices, string bucketName, string fileName) =>
{
    using var stream = await minioServices.DownloadFileAsync(bucketName, fileName);
    using var zipStream = new MemoryStream();
    using (var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
    {
        var zipEntry = zipArchive.CreateEntry(fileName, CompressionLevel.Fastest);
        using var entryStream = zipEntry.Open();
        await stream.CopyToAsync(entryStream);
    }

    zipStream.Seek(0, SeekOrigin.Begin);
    return Results.File(zipStream.ToArray(), "application/zip", $"{fileName}.zip");
});

app.Run();
