/**
 * Operações com Streams no MinIO usando Node.js
 * Demonstra como trabalhar com streams para upload e download eficiente.
 */

const Minio = require('minio');
const fs = require('fs');
const stream = require('stream');

// Configuração do cliente MinIO
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

/**
 * Upload usando stream
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 * @param {stream.Readable} readStream - Stream de leitura
 * @param {number} size - Tamanho do stream (se conhecido)
 */
async function uploadViaStream(bucketName, objectName, readStream, size) {
    try {
        const metaData = {
            'Content-Type': 'application/octet-stream'
        };
        
        await minioClient.putObject(bucketName, objectName, readStream, size, metaData);
        console.log(`✓ Stream enviado como '${objectName}'`);
    } catch (err) {
        console.error(`✗ Erro no upload via stream: ${err.message}`);
    }
}

/**
 * Download usando stream
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 */
async function downloadViaStream(bucketName, objectName) {
    try {
        console.log(`\n📥 Baixando '${objectName}' via stream...`);
        
        const dataStream = await minioClient.getObject(bucketName, objectName);
        
        return new Promise((resolve, reject) => {
            let size = 0;
            const chunks = [];
            
            dataStream.on('data', (chunk) => {
                size += chunk.length;
                chunks.push(chunk);
            });
            
            dataStream.on('end', () => {
                const content = Buffer.concat(chunks).toString('utf-8');
                console.log(`✓ Download concluído: ${size} bytes`);
                console.log(`   Conteúdo: ${content.substring(0, 100)}...`);
                resolve(content);
            });
            
            dataStream.on('error', reject);
        });
    } catch (err) {
        console.error(`✗ Erro no download via stream: ${err.message}`);
    }
}

/**
 * Upload de arquivo grande usando stream
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 * @param {string} filePath - Caminho do arquivo
 */
async function uploadLargeFile(bucketName, objectName, filePath) {
    try {
        const fileStream = fs.createReadStream(filePath);
        const stats = fs.statSync(filePath);
        
        console.log(`\n📤 Enviando arquivo grande (${stats.size} bytes)...`);
        
        const metaData = {
            'Content-Type': 'application/octet-stream'
        };
        
        await minioClient.putObject(bucketName, objectName, fileStream, stats.size, metaData);
        console.log(`✓ Arquivo grande enviado com sucesso`);
    } catch (err) {
        console.error(`✗ Erro no upload de arquivo grande: ${err.message}`);
    }
}

/**
 * Download de arquivo grande usando stream para arquivo
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 * @param {string} filePath - Caminho onde salvar
 */
async function downloadLargeFile(bucketName, objectName, filePath) {
    try {
        console.log(`\n📥 Baixando arquivo grande para '${filePath}'...`);
        
        const dataStream = await minioClient.getObject(bucketName, objectName);
        const writeStream = fs.createWriteStream(filePath);
        
        return new Promise((resolve, reject) => {
            let size = 0;
            
            dataStream.on('data', (chunk) => {
                size += chunk.length;
            });
            
            dataStream.on('end', () => {
                console.log(`✓ Download concluído: ${size} bytes escritos`);
                resolve();
            });
            
            dataStream.on('error', reject);
            dataStream.pipe(writeStream);
        });
    } catch (err) {
        console.error(`✗ Erro no download: ${err.message}`);
    }
}

/**
 * Upload com stream transformado (ex: compressão)
 * @param {string} bucketName - Nome do bucket
 * @param {string} objectName - Nome do objeto
 * @param {string} content - Conteúdo original
 */
async function uploadWithTransform(bucketName, objectName, content) {
    try {
        // Stream de transformação simples que converte para maiúsculas
        const transformStream = new stream.Transform({
            transform(chunk, encoding, callback) {
                this.push(chunk.toString().toUpperCase());
                callback();
            }
        });
        
        const readableStream = new stream.Readable();
        readableStream.push(content);
        readableStream.push(null);
        
        const transformedStream = readableStream.pipe(transformStream);
        
        const buffer = Buffer.from(content.toUpperCase());
        await minioClient.putObject(
            bucketName,
            objectName,
            transformedStream,
            buffer.length
        );
        
        console.log(`✓ Conteúdo transformado enviado como '${objectName}'`);
    } catch (err) {
        console.error(`✗ Erro no upload com transformação: ${err.message}`);
    }
}

/**
 * Lista objetos usando stream
 * @param {string} bucketName - Nome do bucket
 * @param {string} prefix - Prefixo para filtrar objetos
 */
async function listObjectsStream(bucketName, prefix = '') {
    try {
        console.log(`\n📋 Listando objetos com prefixo '${prefix}':`);
        
        const objectsStream = minioClient.listObjectsV2(bucketName, prefix, true);
        
        return new Promise((resolve, reject) => {
            const objects = [];
            
            objectsStream.on('data', (obj) => {
                console.log(`  - ${obj.name} (${obj.size} bytes)`);
                objects.push(obj);
            });
            
            objectsStream.on('error', reject);
            
            objectsStream.on('end', () => {
                console.log(`✓ Total: ${objects.length} objetos`);
                resolve(objects);
            });
        });
    } catch (err) {
        console.error(`✗ Erro ao listar objetos: ${err.message}`);
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('='.repeat(60));
    console.log('MinIO Node.js - Operações com Streams');
    console.log('='.repeat(60));
    
    const bucketName = 'nodejs-stream-bucket';
    
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
    
    // 1. Upload via stream básico
    console.log('\n1. Upload via stream básico...');
    const readableStream = new stream.Readable();
    const content = 'Este conteúdo está sendo enviado via stream!';
    readableStream.push(content);
    readableStream.push(null);
    await uploadViaStream(bucketName, 'stream-upload.txt', readableStream, content.length);
    
    // 2. Download via stream
    console.log('\n2. Download via stream...');
    await downloadViaStream(bucketName, 'stream-upload.txt');
    
    // 3. Upload de arquivo grande (criar arquivo de teste)
    console.log('\n3. Upload de arquivo grande...');
    const largeFilePath = '/tmp/large-file.txt';
    let largeContent = '';
    for (let i = 0; i < 10000; i++) {
        largeContent += `Linha ${i}: Este é um arquivo grande para testar streams.\n`;
    }
    fs.writeFileSync(largeFilePath, largeContent);
    await uploadLargeFile(bucketName, 'large-file.txt', largeFilePath);
    
    // 4. Download de arquivo grande
    console.log('\n4. Download de arquivo grande...');
    await downloadLargeFile(bucketName, 'large-file.txt', '/tmp/downloaded-large-file.txt');
    
    // 5. Upload com transformação
    console.log('\n5. Upload com transformação (maiúsculas)...');
    await uploadWithTransform(
        bucketName,
        'transformed.txt',
        'este texto será transformado em maiúsculas'
    );
    
    // 6. Listar objetos via stream
    console.log('\n6. Listando objetos via stream...');
    await listObjectsStream(bucketName);
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ Exemplos de streams concluídos!');
    console.log('='.repeat(60));
    console.log('\n💡 Dicas:');
    console.log('  - Streams são eficientes para arquivos grandes');
    console.log('  - Use pipes para transformar dados durante upload/download');
    console.log('  - Streams evitam carregar todo o arquivo na memória');
}

// Executar
main().catch(err => {
    console.error('Erro na execução:', err);
    process.exit(1);
});
