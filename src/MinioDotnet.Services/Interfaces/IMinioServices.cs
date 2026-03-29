using Minio;

namespace MinioDotnet.Services.Interfaces;

public interface IMinioServices
{
    Task CreateBucket(string bucketName);
    Task<List<string>> ListBuckets();
    Task<bool> BucketExists(string bucketName);
    Task DeleteBucket(string bucketName);
    Task UploadFileAsync(
        string bucketName,
        string objectName,
        Stream fileStream,
        string contentType
    );
    Task<Stream> DownloadFileAsync(string bucketName, string objectName);
}
