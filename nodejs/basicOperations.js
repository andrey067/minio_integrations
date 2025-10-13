/**
 * Operações básicas com MinIO usando Node.js
 * Este script demonstra as operações fundamentais de integração com MinIO.
 */

const Minio = require('minio');
const fs = require('fs');
const path = require('path');

// Configuração do cliente MinIO
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

/**
 * Cria um novo bucket
 * @param {string} bucketName - Nome do bucket
 */
async function createBucket(bucketName) {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`✓ Bucket '${bucketName}' criado com sucesso!`);
        } else {
            console.log(`✓ Bucket '${bucketName}' já existe.`);
        }
    } catch (err) {
        console.error(`✗ Erro ao criar bucket: ${err.message}`);
    }
}

/**
 * Faz upload de um arquivo para o MinIO
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto no MinIO
 * @param {string} filePath - Caminho do arquivo local
 */
async function uploadFile(bucketName, objectName, filePath) {
    try {
        const metaData = {
            'Content-Type': 'text/plain'
        };
        
        await minioClient.fPutObject(bucketName, objectName, filePath, metaData);
        console.log(`✓ Arquivo '${filePath}' enviado como '${objectName}'`);
    } catch (err) {
        console.error(`✗ Erro no upload: ${err.message}`);
    }
}

/**
 * Faz upload de conteúdo de string
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 * @param {string} content - Conteúdo a ser enviado
 */
async function uploadString(bucketName, objectName, content) {
    try {
        const buffer = Buffer.from(content, 'utf-8');
        const metaData = {
            'Content-Type': 'text/plain',
            'Content-Length': buffer.length
        };
        
        await minioClient.putObject(bucketName, objectName, buffer, metaData);
        console.log(`✓ Conteúdo enviado como '${objectName}'`);
    } catch (err) {
        console.error(`✗ Erro no upload: ${err.message}`);
    }
}

/**
 * Faz download de um arquivo do MinIO
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 * @param {string} filePath - Caminho onde salvar o arquivo
 */
async function downloadFile(bucketName, objectName, filePath) {
    try {
        await minioClient.fGetObject(bucketName, objectName, filePath);
        console.log(`✓ Objeto '${objectName}' baixado para '${filePath}'`);
    } catch (err) {
        console.error(`✗ Erro no download: ${err.message}`);
    }
}

/**
 * Lista todos os objetos em um bucket
 * @param {string} bucketName - Nome do bucket
 */
async function listObjects(bucketName) {
    try {
        console.log(`\n📋 Objetos no bucket '${bucketName}':`);
        const stream = minioClient.listObjects(bucketName, '', true);
        
        return new Promise((resolve, reject) => {
            const objects = [];
            stream.on('data', (obj) => {
                console.log(`  - ${obj.name} (Tamanho: ${obj.size} bytes)`);
                objects.push(obj);
            });
            stream.on('error', reject);
            stream.on('end', () => resolve(objects));
        });
    } catch (err) {
        console.error(`✗ Erro ao listar objetos: ${err.message}`);
    }
}

/**
 * Remove um objeto do bucket
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 */
async function deleteObject(bucketName, objectName) {
    try {
        await minioClient.removeObject(bucketName, objectName);
        console.log(`✓ Objeto '${objectName}' removido`);
    } catch (err) {
        console.error(`✗ Erro ao remover objeto: ${err.message}`);
    }
}

/**
 * Obtém informações sobre um objeto
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 */
async function getObjectInfo(bucketName, objectName) {
    try {
        const stat = await minioClient.statObject(bucketName, objectName);
        console.log(`\n📊 Informações do objeto '${objectName}':`);
        console.log(`  - Tamanho: ${stat.size} bytes`);
        console.log(`  - Tipo: ${stat.metaData['content-type']}`);
        console.log(`  - Última modificação: ${stat.lastModified}`);
        console.log(`  - ETag: ${stat.etag}`);
    } catch (err) {
        console.error(`✗ Erro ao obter informações: ${err.message}`);
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('='.repeat(60));
    console.log('MinIO Node.js - Operações Básicas');
    console.log('='.repeat(60));
    
    const bucketName = 'nodejs-example-bucket';
    
    // 1. Criar bucket
    console.log('\n1. Criando bucket...');
    await createBucket(bucketName);
    
    // 2. Upload de string
    console.log('\n2. Fazendo upload de conteúdo...');
    await uploadString(
        bucketName,
        'hello.txt',
        'Olá MinIO! Este é um teste com Node.js.'
    );
    
    // 3. Upload de arquivo
    console.log('\n3. Criando e fazendo upload de arquivo...');
    const tempFile = '/tmp/nodejs-example.txt';
    fs.writeFileSync(tempFile, 
        'Este é um arquivo de exemplo criado em Node.js.\n' +
        'MinIO é compatível com Amazon S3.\n'
    );
    await uploadFile(bucketName, 'example.txt', tempFile);
    
    // 4. Listar objetos
    console.log('\n4. Listando objetos...');
    await listObjects(bucketName);
    
    // 5. Obter informações do objeto
    console.log('\n5. Obtendo informações do objeto...');
    await getObjectInfo(bucketName, 'example.txt');
    
    // 6. Download de arquivo
    console.log('\n6. Fazendo download...');
    const downloadPath = '/tmp/downloaded-nodejs-example.txt';
    await downloadFile(bucketName, 'example.txt', downloadPath);
    
    const content = fs.readFileSync(downloadPath, 'utf-8');
    console.log(`   Conteúdo baixado:\n   ${content}`);
    
    // 7. Deletar objeto (opcional)
    // console.log('\n7. Removendo objeto...');
    // await deleteObject(bucketName, 'hello.txt');
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ Todos os exemplos foram executados!');
    console.log('='.repeat(60));
}

// Executar
main().catch(err => {
    console.error('Erro na execução:', err);
    process.exit(1);
});
