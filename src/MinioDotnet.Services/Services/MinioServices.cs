using Minio;
using Minio.DataModel.Args;
using MinioDotnet.Services.Interfaces;

namespace MinioDotnet.Services.Services;

public class MinioServices : IMinioServices
{
    private readonly IMinioClient _minio;

    public MinioServices(IMinioClient minio) =>
        _minio = minio ?? throw new ArgumentNullException(nameof(_minio));

    public async Task CreateBucket(string bucketName)
    {
        try
        {
            var args = new MakeBucketArgs().WithBucket(bucketName);
            await _minio.MakeBucketAsync(args);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao criar bucket: {ex.Message}");
        }
    }

    public async Task<List<string>> ListBuckets()
    {
        var buckets = await _minio.ListBucketsAsync();
        return buckets.Buckets.Select(b => b.Name).ToList();
    }

    public async Task<bool> BucketExists(string bucketName)
    {
        try
        {
            var args = new BucketExistsArgs().WithBucket(bucketName);
            return await _minio.BucketExistsAsync(args);
        }
        catch
        {
            return false;
        }
    }

    public async Task DeleteBucket(string bucketName)
    {
        try
        {
            var args = new RemoveBucketArgs().WithBucket(bucketName);
            await _minio.RemoveBucketAsync(args);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao excluir bucket: {ex.Message}");
        }
    }

    public async Task UploadFileAsync(
        string bucketName,
        string objectName,
        Stream fileStream,
        string contentType
    )
    {
        try
        {
            var args = new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithStreamData(fileStream)
                .WithObjectSize(fileStream.Length)
                .WithContentType(contentType);

            await _minio.PutObjectAsync(args);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao fazer upload: {ex.Message}");
        }
    }

    public async Task<Stream> DownloadFileAsync(string bucketName, string objectName)
    {
        var memoryStream = new MemoryStream();
        var args = new GetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithCallbackStream(s => s.CopyTo(memoryStream));

        await _minio.GetObjectAsync(args);
        memoryStream.Position = 0;
        return memoryStream;
    }
}
