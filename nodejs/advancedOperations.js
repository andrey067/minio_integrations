/**
 * Operações avançadas com MinIO usando Node.js
 * Demonstra recursos como presigned URLs, metadados customizados e políticas.
 */

const Minio = require('minio');

// Configuração do cliente MinIO
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

/**
 * Upload com metadados customizados
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 * @param {string} content - Conteúdo
 * @param {object} metadata - Metadados customizados
 */
async function uploadWithMetadata(bucketName, objectName, content, metadata) {
    try {
        const buffer = Buffer.from(content, 'utf-8');
        
        // Metadados devem ter prefixo 'x-amz-meta-' ou serem headers HTTP padrão
        const enrichedMetadata = {
            'Content-Type': 'text/plain',
            'Content-Length': buffer.length,
            ...Object.fromEntries(
                Object.entries(metadata).map(([k, v]) => [`x-amz-meta-${k}`, v])
            )
        };
        
        await minioClient.putObject(bucketName, objectName, buffer, enrichedMetadata);
        console.log(`✓ Objeto '${objectName}' enviado com metadados`);
    } catch (err) {
        console.error(`✗ Erro no upload: ${err.message}`);
    }
}

/**
 * Gera URL pré-assinada para download
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 * @param {number} expirySeconds - Tempo de expiração em segundos
 */
async function generatePresignedUrl(bucketName, objectName, expirySeconds = 3600) {
    try {
        const url = await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
        console.log(`\n🔗 URL pré-assinada gerada (válida por ${expirySeconds}s):`);
        console.log(`  ${url}`);
        return url;
    } catch (err) {
        console.error(`✗ Erro ao gerar URL: ${err.message}`);
        return null;
    }
}

/**
 * Gera URL pré-assinada para upload
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 * @param {number} expirySeconds - Tempo de expiração em segundos
 */
async function generatePresignedPutUrl(bucketName, objectName, expirySeconds = 3600) {
    try {
        const url = await minioClient.presignedPutObject(bucketName, objectName, expirySeconds);
        console.log(`\n🔗 URL pré-assinada para upload gerada (válida por ${expirySeconds}s):`);
        console.log(`  ${url}`);
        return url;
    } catch (err) {
        console.error(`✗ Erro ao gerar URL de upload: ${err.message}`);
        return null;
    }
}

/**
 * Copia um objeto
 * @param {string} sourceBucket - Bucket de origem
 * @param {string} sourceObject - Objeto de origem
 * @param {string} destBucket - Bucket de destino
 * @param {string} destObject - Objeto de destino
 */
async function copyObject(sourceBucket, sourceObject, destBucket, destObject) {
    try {
        const conds = new Minio.CopyConditions();
        
        await minioClient.copyObject(
            destBucket,
            destObject,
            `/${sourceBucket}/${sourceObject}`,
            conds
        );
        console.log(`✓ Objeto copiado de '${sourceBucket}/${sourceObject}' para '${destBucket}/${destObject}'`);
    } catch (err) {
        console.error(`✗ Erro ao copiar: ${err.message}`);
    }
}

/**
 * Lista todos os buckets
 */
async function listBuckets() {
    try {
        const buckets = await minioClient.listBuckets();
        console.log('\n🗂️  Buckets disponíveis:');
        buckets.forEach(bucket => {
            console.log(`  - ${bucket.name} (Criado em: ${bucket.creationDate})`);
        });
    } catch (err) {
        console.error(`✗ Erro ao listar buckets: ${err.message}`);
    }
}

/**
 * Obtém estatísticas do objeto incluindo metadados
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 */
async function getObjectStats(bucketName, objectName) {
    try {
        const stat = await minioClient.statObject(bucketName, objectName);
        console.log(`\n📊 Estatísticas do objeto '${objectName}':`);
        console.log(`  - Tamanho: ${stat.size} bytes`);
        console.log(`  - Tipo: ${stat.metaData['content-type']}`);
        console.log(`  - Última modificação: ${stat.lastModified}`);
        console.log(`  - ETag: ${stat.etag}`);
        
        // Listar metadados customizados (começam com 'x-amz-meta-')
        console.log('  - Metadados customizados:');
        Object.entries(stat.metaData).forEach(([key, value]) => {
            if (key.startsWith('x-amz-meta-')) {
                const cleanKey = key.replace('x-amz-meta-', '');
                console.log(`    * ${cleanKey}: ${value}`);
            }
        });
    } catch (err) {
        console.error(`✗ Erro ao obter estatísticas: ${err.message}`);
    }
}

/**
 * Define política de acesso ao bucket
 * @param {string} bucketName - Nome do bucket
 */
async function setBucketPolicy(bucketName) {
    try {
        // Política para leitura pública de objetos com prefixo 'public/'
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${bucketName}/public/*`]
                }
            ]
        };
        
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`✓ Política de bucket definida para '${bucketName}'`);
    } catch (err) {
        console.error(`✗ Erro ao definir política: ${err.message}`);
    }
}

/**
 * Remove múltiplos objetos
 * @param {string} bucketName - Nome do bucket
 * @param {Array<string>} objectNames - Lista de nomes de objetos
 */
async function removeMultipleObjects(bucketName, objectNames) {
    try {
        await minioClient.removeObjects(bucketName, objectNames);
        console.log(`✓ ${objectNames.length} objetos removidos`);
    } catch (err) {
        console.error(`✗ Erro ao remover objetos: ${err.message}`);
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('='.repeat(60));
    console.log('MinIO Node.js - Operações Avançadas');
    console.log('='.repeat(60));
    
    const bucketName = 'nodejs-advanced-bucket';
    
    // Criar bucket se não existir
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`✓ Bucket '${bucketName}' criado.`);
        } else {
            console.log(`✓ Usando bucket existente '${bucketName}'.`);
        }
    } catch (err) {
        console.error(`✗ Erro: ${err.message}`);
        return;
    }
    
    // 1. Upload com metadados
    console.log('\n1. Upload com metadados customizados...');
    await uploadWithMetadata(
        bucketName,
        'document-with-metadata.txt',
        'Este documento possui metadados customizados.',
        {
            author: 'Node.js Script',
            version: '1.0',
            description: 'Exemplo de arquivo com metadados'
        }
    );
    
    // 2. Obter estatísticas e metadados
    console.log('\n2. Obtendo estatísticas e metadados...');
    await getObjectStats(bucketName, 'document-with-metadata.txt');
    
    // 3. Gerar URL pré-assinada para download
    console.log('\n3. Gerando URL pré-assinada para download...');
    await generatePresignedUrl(bucketName, 'document-with-metadata.txt', 1800);
    
    // 4. Gerar URL pré-assinada para upload
    console.log('\n4. Gerando URL pré-assinada para upload...');
    await generatePresignedPutUrl(bucketName, 'upload-via-url.txt', 1800);
    
    // 5. Copiar objeto
    console.log('\n5. Copiando objeto...');
    await copyObject(
        bucketName,
        'document-with-metadata.txt',
        bucketName,
        'document-copy.txt'
    );
    
    // 6. Listar todos os buckets
    console.log('\n6. Listando todos os buckets...');
    await listBuckets();
    
    // 7. Definir política de bucket (opcional)
    // console.log('\n7. Definindo política de bucket...');
    // await setBucketPolicy(bucketName);
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ Exemplos avançados concluídos!');
    console.log('='.repeat(60));
    console.log('\n💡 Dicas:');
    console.log('  - Use presigned URLs para compartilhar objetos temporariamente');
    console.log('  - Metadados são úteis para armazenar informações adicionais');
    console.log('  - Políticas de bucket controlam o acesso aos objetos');
}

// Executar
main().catch(err => {
    console.error('Erro na execução:', err);
    process.exit(1);
});
