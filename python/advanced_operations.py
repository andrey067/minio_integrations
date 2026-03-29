#!/usr/bin/env python3
"""
Operações avançadas com MinIO usando Python.
Este script demonstra recursos mais avançados como presigned URLs,
metadados, e gestão de políticas.
"""

from minio import Minio
from minio.error import S3Error
from datetime import timedelta
import io
import json

# Configuração do cliente MinIO
client = Minio(
    "localhost:9000",
    access_key="minioadmin",
    secret_key="minioadmin",
    secure=False
)

def upload_with_metadata(bucket_name, object_name, content, metadata):
    """
    Faz upload de um objeto com metadados customizados.
    
    Args:
        bucket_name (str): Nome do bucket
        object_name (str): Nome do objeto
        content (str): Conteúdo a ser enviado
        metadata (dict): Dicionário com metadados
    """
    try:
        content_bytes = content.encode('utf-8')
        content_stream = io.BytesIO(content_bytes)
        
        client.put_object(
            bucket_name,
            object_name,
            content_stream,
            length=len(content_bytes),
            content_type='text/plain',
            metadata=metadata
        )
        print(f"✓ Objeto '{object_name}' enviado com metadados: {metadata}")
    except S3Error as err:
        print(f"✗ Erro no upload: {err}")

def get_object_metadata(bucket_name, object_name):
    """
    Obtém os metadados de um objeto.
    
    Args:
        bucket_name (str): Nome do bucket
        object_name (str): Nome do objeto
    """
    try:
        stat = client.stat_object(bucket_name, object_name)
        print(f"\n📊 Metadados do objeto '{object_name}':")
        print(f"  - Tamanho: {stat.size} bytes")
        print(f"  - Tipo: {stat.content_type}")
        print(f"  - Última modificação: {stat.last_modified}")
        print(f"  - ETag: {stat.etag}")
        if stat.metadata:
            print(f"  - Metadados customizados: {stat.metadata}")
    except S3Error as err:
        print(f"✗ Erro ao obter metadados: {err}")

def generate_presigned_url(bucket_name, object_name, expires=timedelta(hours=1)):
    """
    Gera uma URL pré-assinada para acesso temporário ao objeto.
    
    Args:
        bucket_name (str): Nome do bucket
        object_name (str): Nome do objeto
        expires (timedelta): Tempo de expiração da URL
    """
    try:
        url = client.presigned_get_object(bucket_name, object_name, expires=expires)
        print(f"\n🔗 URL pré-assinada gerada (válida por {expires}):")
        print(f"  {url}")
        return url
    except S3Error as err:
        print(f"✗ Erro ao gerar URL: {err}")
        return None

def generate_presigned_put_url(bucket_name, object_name, expires=timedelta(hours=1)):
    """
    Gera uma URL pré-assinada para upload de objeto.
    
    Args:
        bucket_name (str): Nome do bucket
        object_name (str): Nome do objeto
        expires (timedelta): Tempo de expiração da URL
    """
    try:
        url = client.presigned_put_object(bucket_name, object_name, expires=expires)
        print(f"\n🔗 URL pré-assinada para upload gerada (válida por {expires}):")
        print(f"  {url}")
        return url
    except S3Error as err:
        print(f"✗ Erro ao gerar URL de upload: {err}")
        return None

def copy_object(source_bucket, source_object, dest_bucket, dest_object):
    """
    Copia um objeto de um bucket para outro (ou dentro do mesmo bucket).
    
    Args:
        source_bucket (str): Bucket de origem
        source_object (str): Objeto de origem
        dest_bucket (str): Bucket de destino
        dest_object (str): Nome do objeto de destino
    """
    try:
        from minio.commonconfig import CopySource
        
        client.copy_object(
            dest_bucket,
            dest_object,
            CopySource(source_bucket, source_object)
        )
        print(f"✓ Objeto copiado de '{source_bucket}/{source_object}' para '{dest_bucket}/{dest_object}'")
    except S3Error as err:
        print(f"✗ Erro ao copiar objeto: {err}")

def list_buckets():
    """
    Lista todos os buckets disponíveis.
    """
    try:
        buckets = client.list_buckets()
        print("\n🗂️  Buckets disponíveis:")
        for bucket in buckets:
            print(f"  - {bucket.name} (Criado em: {bucket.creation_date})")
    except S3Error as err:
        print(f"✗ Erro ao listar buckets: {err}")

def upload_large_file_multipart(bucket_name, object_name, file_path):
    """
    Upload de arquivo grande com suporte a multipart.
    O MinIO SDK automaticamente usa multipart para arquivos grandes.
    
    Args:
        bucket_name (str): Nome do bucket
        object_name (str): Nome do objeto
        file_path (str): Caminho do arquivo
    """
    try:
        # O MinIO SDK automaticamente divide em partes para arquivos > 5MB
        result = client.fput_object(
            bucket_name,
            object_name,
            file_path
        )
        print(f"✓ Arquivo enviado: {result.object_name}")
        print(f"  ETag: {result.etag}")
    except S3Error as err:
        print(f"✗ Erro no upload: {err}")

def main():
    """
    Função principal que executa exemplos avançados.
    """
    print("=" * 60)
    print("MinIO Python - Operações Avançadas")
    print("=" * 60)
    
    bucket_name = "python-advanced-bucket"
    
    # Criar bucket se não existir
    try:
        if not client.bucket_exists(bucket_name):
            client.make_bucket(bucket_name)
            print(f"✓ Bucket '{bucket_name}' criado.")
        else:
            print(f"✓ Usando bucket existente '{bucket_name}'.")
    except S3Error as err:
        print(f"✗ Erro: {err}")
        return
    
    # 1. Upload com metadados
    print("\n1. Upload com metadados customizados...")
    metadata = {
        "author": "Python Script",
        "version": "1.0",
        "description": "Exemplo de arquivo com metadados"
    }
    upload_with_metadata(
        bucket_name,
        "document-with-metadata.txt",
        "Este documento possui metadados customizados.",
        metadata
    )
    
    # 2. Obter metadados
    print("\n2. Obtendo metadados do objeto...")
    get_object_metadata(bucket_name, "document-with-metadata.txt")
    
    # 3. Gerar URL pré-assinada para download
    print("\n3. Gerando URL pré-assinada para download...")
    generate_presigned_url(bucket_name, "document-with-metadata.txt", expires=timedelta(minutes=30))
    
    # 4. Gerar URL pré-assinada para upload
    print("\n4. Gerando URL pré-assinada para upload...")
    generate_presigned_put_url(bucket_name, "upload-via-url.txt", expires=timedelta(minutes=30))
    
    # 5. Copiar objeto
    print("\n5. Copiando objeto...")
    copy_object(
        bucket_name,
        "document-with-metadata.txt",
        bucket_name,
        "document-copy.txt"
    )
    
    # 6. Listar todos os buckets
    print("\n6. Listando todos os buckets...")
    list_buckets()
    
    print("\n" + "=" * 60)
    print("✓ Exemplos avançados concluídos!")
    print("=" * 60)
    print("\n💡 Dicas:")
    print("  - Use presigned URLs para compartilhar objetos temporariamente")
    print("  - Metadados são úteis para armazenar informações adicionais")
    print("  - O MinIO automaticamente gerencia uploads grandes (multipart)")

if __name__ == "__main__":
    main()
