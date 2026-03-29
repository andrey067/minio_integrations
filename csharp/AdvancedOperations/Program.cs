using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Threading.Tasks;
using Minio;
using Minio.DataModel.Args;

namespace AdvancedOperations
{
    /// <summary>
    /// Operações avançadas com MinIO usando C#.
    /// Demonstra recursos como presigned URLs, metadados customizados e gestão de buckets.
    /// </summary>
    class Program
    {
        private const string Endpoint = "localhost:9000";
        private const string AccessKey = "minioadmin";
        private const string SecretKey = "minioadmin";

        static async Task Main(string[] args)
        {
            Console.WriteLine(new string('=', 60));
            Console.WriteLine("MinIO C# - Operações Avançadas");
            Console.WriteLine(new string('=', 60));

            try
            {
                // Inicializar cliente MinIO
                var minio = new MinioClient()
                    .WithEndpoint(Endpoint)
                    .WithCredentials(AccessKey, SecretKey)
                    .Build();

                Console.WriteLine("✓ Cliente MinIO inicializado");

                string bucketName = "csharp-advanced-bucket";

                // Criar bucket se não existir
                Console.WriteLine("\nVerificando/criando bucket...");
                await EnsureBucketAsync(minio, bucketName);

                // 1. Upload com metadados
                Console.WriteLine("\n1. Upload com metadados customizados...");
                var metadata = new Dictionary<string, string>
                {
                    { "X-Amz-Meta-Author", "C# Script" },
                    { "X-Amz-Meta-Version", "1.0" },
                    { "X-Amz-Meta-Description", "Exemplo de arquivo com metadados" }
                };
                await UploadWithMetadataAsync(minio, bucketName, "document-with-metadata.txt",
                    "Este documento possui metadados customizados.", metadata);

                // 2. Obter informações e metadados
                Console.WriteLine("\n2. Obtendo informações e metadados...");
                await GetObjectStatsAsync(minio, bucketName, "document-with-metadata.txt");

                // 3. Gerar URL pré-assinada para download
                Console.WriteLine("\n3. Gerando URL pré-assinada para download...");
                await GeneratePresignedUrlAsync(minio, bucketName, "document-with-metadata.txt", 1800);

                // 4. Gerar URL pré-assinada para upload
                Console.WriteLine("\n4. Gerando URL pré-assinada para upload...");
                await GeneratePresignedPutUrlAsync(minio, bucketName, "upload-via-url.txt", 1800);

                // 5. Copiar objeto
                Console.WriteLine("\n5. Copiando objeto...");
                await CopyObjectAsync(minio, bucketName, "document-with-metadata.txt",
                    bucketName, "document-copy.txt");

                // 6. Listar todos os buckets
                Console.WriteLine("\n6. Listando todos os buckets...");
                await ListBucketsAsync(minio);

                // 7. Verificar se objeto existe
                Console.WriteLine("\n7. Verificando existência de objeto...");
                await CheckObjectExistsAsync(minio, bucketName, "document-with-metadata.txt");

                Console.WriteLine("\n" + new string('=', 60));
                Console.WriteLine("✓ Exemplos avançados concluídos!");
                Console.WriteLine(new string('=', 60));
                Console.WriteLine("\n💡 Dicas:");
                Console.WriteLine("  - Use presigned URLs para compartilhar objetos temporariamente");
                Console.WriteLine("  - Metadados são úteis para armazenar informações adicionais");
                Console.WriteLine("  - O MinIO SDK gerencia automaticamente uploads grandes");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro na execução: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
        }

        /// <summary>
        /// Garante que o bucket existe
        /// </summary>
        static async Task EnsureBucketAsync(IMinioClient minio, string bucketName)
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
                    Console.WriteLine($"✓ Bucket '{bucketName}' criado.");
                }
                else
                {
                    Console.WriteLine($"✓ Usando bucket existente '{bucketName}'.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao criar bucket: {ex.Message}");
            }
        }

        /// <summary>
        /// Upload com metadados customizados
        /// </summary>
        static async Task UploadWithMetadataAsync(IMinioClient minio, string bucketName, string objectName,
            string content, Dictionary<string, string> metadata)
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
                    .WithContentType("text/plain")
                    .WithHeaders(metadata);

                await minio.PutObjectAsync(putObjectArgs);
                Console.WriteLine($"✓ Objeto '{objectName}' enviado com metadados");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro no upload: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtém estatísticas e metadados do objeto
        /// </summary>
        static async Task GetObjectStatsAsync(IMinioClient minio, string bucketName, string objectName)
        {
            try
            {
                var statObjectArgs = new StatObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName);

                var stat = await minio.StatObjectAsync(statObjectArgs);

                Console.WriteLine($"\n📊 Estatísticas do objeto '{objectName}':");
                Console.WriteLine($"  - Tamanho: {stat.Size} bytes");
                Console.WriteLine($"  - Tipo: {stat.ContentType}");
                Console.WriteLine($"  - Última modificação: {stat.LastModified}");
                Console.WriteLine($"  - ETag: {stat.ETag}");

                // Listar metadados customizados
                Console.WriteLine("  - Metadados customizados:");
                if (stat.MetaData != null && stat.MetaData.Count > 0)
                {
                    foreach (var kvp in stat.MetaData)
                    {
                        if (kvp.Key.StartsWith("X-Amz-Meta-", StringComparison.OrdinalIgnoreCase))
                        {
                            string cleanKey = kvp.Key.Substring("X-Amz-Meta-".Length);
                            Console.WriteLine($"    * {cleanKey}: {kvp.Value}");
                        }
                    }
                }
                else
                {
                    Console.WriteLine("    (nenhum metadado customizado)");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao obter estatísticas: {ex.Message}");
            }
        }

        /// <summary>
        /// Gera URL pré-assinada para download
        /// </summary>
        static async Task GeneratePresignedUrlAsync(IMinioClient minio, string bucketName, string objectName, int expirySeconds)
        {
            try
            {
                var args = new PresignedGetObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName)
                    .WithExpiry(expirySeconds);

                string url = await minio.PresignedGetObjectAsync(args);
                Console.WriteLine($"\n🔗 URL pré-assinada gerada (válida por {expirySeconds}s):");
                Console.WriteLine($"  {url}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao gerar URL: {ex.Message}");
            }
        }

        /// <summary>
        /// Gera URL pré-assinada para upload
        /// </summary>
        static async Task GeneratePresignedPutUrlAsync(IMinioClient minio, string bucketName, string objectName, int expirySeconds)
        {
            try
            {
                var args = new PresignedPutObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName)
                    .WithExpiry(expirySeconds);

                string url = await minio.PresignedPutObjectAsync(args);
                Console.WriteLine($"\n🔗 URL pré-assinada para upload gerada (válida por {expirySeconds}s):");
                Console.WriteLine($"  {url}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao gerar URL de upload: {ex.Message}");
            }
        }

        /// <summary>
        /// Copia um objeto
        /// </summary>
        static async Task CopyObjectAsync(IMinioClient minio, string srcBucket, string srcObject,
            string dstBucket, string dstObject)
        {
            try
            {
                var copySourceArgs = new CopySourceObjectArgs()
                    .WithBucket(srcBucket)
                    .WithObject(srcObject);

                var copyObjectArgs = new CopyObjectArgs()
                    .WithBucket(dstBucket)
                    .WithObject(dstObject)
                    .WithCopyObjectSource(copySourceArgs);

                await minio.CopyObjectAsync(copyObjectArgs);
                Console.WriteLine($"✓ Objeto copiado de '{srcBucket}/{srcObject}' para '{dstBucket}/{dstObject}'");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao copiar: {ex.Message}");
            }
        }

        /// <summary>
        /// Lista todos os buckets
        /// </summary>
        static async Task ListBucketsAsync(IMinioClient minio)
        {
            try
            {
                var buckets = await minio.ListBucketsAsync();
                Console.WriteLine("\n🗂️  Buckets disponíveis:");
                foreach (var bucket in buckets.Buckets)
                {
                    Console.WriteLine($"  - {bucket.Name} (Criado em: {bucket.CreationDateDateTime})");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Erro ao listar buckets: {ex.Message}");
            }
        }

        /// <summary>
        /// Verifica se um objeto existe
        /// </summary>
        static async Task CheckObjectExistsAsync(IMinioClient minio, string bucketName, string objectName)
        {
            try
            {
                var statObjectArgs = new StatObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName);

                await minio.StatObjectAsync(statObjectArgs);
                Console.WriteLine($"✓ Objeto '{objectName}' existe no bucket '{bucketName}'");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Objeto não existe ou erro: {ex.Message}");
            }
        }
    }
}
