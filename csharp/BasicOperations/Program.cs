using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Minio;
using Minio.DataModel.Args;

namespace BasicOperations
{
    /// <summary>
    /// Exemplos básicos de operações com MinIO usando C#.
    /// Demonstra operações fundamentais como criar buckets, upload, download e listagem.
    /// </summary>
    class Program
    {
        private const string Endpoint = "localhost:9000";
        private const string AccessKey = "minioadmin";
        private const string SecretKey = "minioadmin";

        static async Task Main(string[] args)
        {
            Console.WriteLine(new string('=', 60));
            Console.WriteLine("MinIO C# - Operações Básicas");
            Console.WriteLine(new string('=', 60));

            try
            {
                // Inicializar cliente MinIO
                var minio = new MinioClient()
                    .WithEndpoint(Endpoint)
                    .WithCredentials(AccessKey, SecretKey)
                    .Build();

                Console.WriteLine("✓ Cliente MinIO inicializado");

                string bucketName = "csharp-example-bucket";

                // 1. Criar bucket
                Console.WriteLine("\n1. Criando bucket...");
                await CreateBucketAsync(minio, bucketName);

                // 2. Upload de string
                Console.WriteLine("\n2. Fazendo upload de conteúdo...");
                await UploadStringAsync(minio, bucketName, "hello.txt", "Olá MinIO! Este é um teste com C#.");

                // 3. Upload de arquivo
                Console.WriteLine("\n3. Criando e fazendo upload de arquivo...");
                string tempFile = Path.Combine(Path.GetTempPath(), "csharp-example.txt");
                string content = "Este é um arquivo de exemplo criado em C#.\nMinIO é compatível com Amazon S3.\n";
                File.WriteAllText(tempFile, content);
                await UploadFileAsync(minio, bucketName, "example.txt", tempFile);

                // 4. Listar objetos
                Console.WriteLine("\n4. Listando objetos...");
                await ListObjectsAsync(minio, bucketName);

                // 5. Obter informações do objeto
                Console.WriteLine("\n5. Obtendo informações do objeto...");
                await GetObjectInfoAsync(minio, bucketName, "example.txt");

                // 6. Download de arquivo
                Console.WriteLine("\n6. Fazendo download...");
                string downloadPath = Path.Combine(Path.GetTempPath(), "downloaded-csharp-example.txt");
                await DownloadFileAsync(minio, bucketName, "example.txt", downloadPath);

                string downloadedContent = File.ReadAllText(downloadPath);
                Console.WriteLine($"   Conteúdo baixado:\n   {downloadedContent}");

                // 7. Deletar objeto (opcional)
                // Console.WriteLine("\n7. Removendo objeto...");
                // await DeleteObjectAsync(minio, bucketName, "hello.txt");

                Console.WriteLine("\n" + new string('=', 60));
                Console.WriteLine("✓ Todos os exemplos foram executados!");
                Console.WriteLine(new string('=', 60));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro na execução: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
        }

        /// <summary>
        /// Cria um novo bucket
        /// </summary>
        static async Task CreateBucketAsync(IMinioClient minio, string bucketName)
        {
            try
            {
                var beArgs = new BucketExistsArgs()
                    .WithBucket(bucketName);
                bool found = await minio.BucketExistsAsync(beArgs);

                if (!found)
                {
                    var mbArgs = new MakeBucketArgs()
                        .WithBucket(bucketName);
                    await minio.MakeBucketAsync(mbArgs);
                    Console.WriteLine($"✓ Bucket '{bucketName}' criado com sucesso!");
                }
                else
                {
                    Console.WriteLine($"✓ Bucket '{bucketName}' já existe.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao criar bucket: {ex.Message}");
            }
        }

        /// <summary>
        /// Faz upload de uma string como objeto
        /// </summary>
        static async Task UploadStringAsync(IMinioClient minio, string bucketName, string objectName, string content)
        {
            try
            {
                byte[] bytes = Encoding.UTF8.GetBytes(content);
                using var stream = new MemoryStream(bytes);

                var putObjectArgs = new PutObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName)
                    .WithStreamData(stream)
                    .WithObjectSize(bytes.Length)
                    .WithContentType("text/plain");

                await minio.PutObjectAsync(putObjectArgs);
                Console.WriteLine($"✓ Conteúdo enviado como '{objectName}'");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro no upload: {ex.Message}");
            }
        }

        /// <summary>
        /// Faz upload de um arquivo
        /// </summary>
        static async Task UploadFileAsync(IMinioClient minio, string bucketName, string objectName, string filePath)
        {
            try
            {
                var putObjectArgs = new PutObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName)
                    .WithFileName(filePath)
                    .WithContentType("text/plain");

                await minio.PutObjectAsync(putObjectArgs);
                Console.WriteLine($"✓ Arquivo '{filePath}' enviado como '{objectName}'");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro no upload: {ex.Message}");
            }
        }

        /// <summary>
        /// Lista todos os objetos em um bucket
        /// </summary>
        static async Task ListObjectsAsync(IMinioClient minio, string bucketName)
        {
            try
            {
                Console.WriteLine($"\n📋 Objetos no bucket '{bucketName}':");

                var listArgs = new ListObjectsArgs()
                    .WithBucket(bucketName)
                    .WithRecursive(true);

                await foreach (var item in minio.ListObjectsEnumAsync(listArgs))
                {
                    Console.WriteLine($"  - {item.Key} (Tamanho: {item.Size} bytes)");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao listar objetos: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtém informações sobre um objeto
        /// </summary>
        static async Task GetObjectInfoAsync(IMinioClient minio, string bucketName, string objectName)
        {
            try
            {
                var statObjectArgs = new StatObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName);

                var stat = await minio.StatObjectAsync(statObjectArgs);

                Console.WriteLine($"\n📊 Informações do objeto '{objectName}':");
                Console.WriteLine($"  - Tamanho: {stat.Size} bytes");
                Console.WriteLine($"  - Tipo: {stat.ContentType}");
                Console.WriteLine($"  - Última modificação: {stat.LastModified}");
                Console.WriteLine($"  - ETag: {stat.ETag}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao obter informações: {ex.Message}");
            }
        }

        /// <summary>
        /// Faz download de um arquivo
        /// </summary>
        static async Task DownloadFileAsync(IMinioClient minio, string bucketName, string objectName, string filePath)
        {
            try
            {
                var getObjectArgs = new GetObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName)
                    .WithFile(filePath);

                await minio.GetObjectAsync(getObjectArgs);
                Console.WriteLine($"✓ Objeto '{objectName}' baixado para '{filePath}'");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro no download: {ex.Message}");
            }
        }

        /// <summary>
        /// Remove um objeto do bucket
        /// </summary>
        static async Task DeleteObjectAsync(IMinioClient minio, string bucketName, string objectName)
        {
            try
            {
                var removeObjectArgs = new RemoveObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName);

                await minio.RemoveObjectAsync(removeObjectArgs);
                Console.WriteLine($"✓ Objeto '{objectName}' removido");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao remover objeto: {ex.Message}");
            }
        }
    }
}
