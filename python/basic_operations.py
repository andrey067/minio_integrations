#!/usr/bin/env python3
"""
Exemplos básicos de operações com MinIO usando Python.
Este script demonstra operações fundamentais como criar buckets,
fazer upload, download e listar objetos.
"""

from minio import Minio
from minio.error import S3Error
import io
import os

# Configuração do cliente MinIO
client = Minio(
    "localhost:9000",
    access_key="minioadmin",
    secret_key="minioadmin",
    secure=False  # Use True se estiver usando HTTPS
)

def create_bucket(bucket_name):
    """
    Cria um novo bucket no MinIO.
    
    Args:
        bucket_name (str): Nome do bucket a ser criado
    """
    try:
        # Verifica se o bucket já existe
        if not client.bucket_exists(bucket_name):
            client.make_bucket(bucket_name)
            print(f"✓ Bucket '{bucket_name}' criado com sucesso!")
        else:
            print(f"✓ Bucket '{bucket_name}' já existe.")
    except S3Error as err:
        print(f"✗ Erro ao criar bucket: {err}")

def upload_file(bucket_name, object_name, file_path):
    """
    Faz upload de um arquivo para o MinIO.
    
    Args:
        bucket_name (str): Nome do bucket
        object_name (str): Nome do objeto no MinIO
        file_path (str): Caminho do arquivo local
    """
    try:
        client.fput_object(bucket_name, object_name, file_path)
        print(f"✓ Arquivo '{file_path}' enviado como '{object_name}' para o bucket '{bucket_name}'")
    except S3Error as err:
        print(f"✗ Erro no upload: {err}")

def upload_string(bucket_name, object_name, content):
    """
    Faz upload de uma string como objeto no MinIO.
    
    Args:
        bucket_name (str): Nome do bucket
        object_name (str): Nome do objeto no MinIO
        content (str): Conteúdo a ser enviado
    """
    try:
        # Converte string para bytes
        content_bytes = content.encode('utf-8')
        
        # Cria um objeto BytesIO
        content_stream = io.BytesIO(content_bytes)
        
        # Upload do stream
        client.put_object(
            bucket_name,
            object_name,
            content_stream,
            length=len(content_bytes),
            content_type='text/plain'
        )
        print(f"✓ Conteúdo enviado como '{object_name}' para o bucket '{bucket_name}'")
    except S3Error as err:
        print(f"✗ Erro no upload: {err}")

def download_file(bucket_name, object_name, file_path):
    """
    Faz download de um arquivo do MinIO.
    
    Args:
        bucket_name (str): Nome do bucket
        object_name (str): Nome do objeto no MinIO
        file_path (str): Caminho onde salvar o arquivo
    """
    try:
        client.fget_object(bucket_name, object_name, file_path)
        print(f"✓ Objeto '{object_name}' baixado para '{file_path}'")
    except S3Error as err:
        print(f"✗ Erro no download: {err}")

def list_objects(bucket_name):
    """
    Lista todos os objetos em um bucket.
    
    Args:
        bucket_name (str): Nome do bucket
    """
    try:
        print(f"\n📋 Objetos no bucket '{bucket_name}':")
        objects = client.list_objects(bucket_name)
        for obj in objects:
            print(f"  - {obj.object_name} (Tamanho: {obj.size} bytes)")
    except S3Error as err:
        print(f"✗ Erro ao listar objetos: {err}")

def delete_object(bucket_name, object_name):
    """
    Remove um objeto do bucket.
    
    Args:
        bucket_name (str): Nome do bucket
        object_name (str): Nome do objeto a ser removido
    """
    try:
        client.remove_object(bucket_name, object_name)
        print(f"✓ Objeto '{object_name}' removido do bucket '{bucket_name}'")
    except S3Error as err:
        print(f"✗ Erro ao remover objeto: {err}")

def main():
    """
    Função principal que executa todos os exemplos.
    """
    print("=" * 60)
    print("MinIO Python - Operações Básicas")
    print("=" * 60)
    
    bucket_name = "python-example-bucket"
    
    # 1. Criar bucket
    print("\n1. Criando bucket...")
    create_bucket(bucket_name)
    
    # 2. Upload de string
    print("\n2. Fazendo upload de conteúdo...")
    upload_string(bucket_name, "hello.txt", "Olá MinIO! Este é um teste do Python.")
    
    # 3. Upload de arquivo (criamos um arquivo temporário para o exemplo)
    print("\n3. Criando e fazendo upload de arquivo...")
    temp_file = "/tmp/example.txt"
    with open(temp_file, 'w') as f:
        f.write("Este é um arquivo de exemplo criado em Python.\n")
        f.write("MinIO é compatível com Amazon S3.\n")
    upload_file(bucket_name, "example.txt", temp_file)
    
    # 4. Listar objetos
    print("\n4. Listando objetos no bucket...")
    list_objects(bucket_name)
    
    # 5. Download de arquivo
    print("\n5. Fazendo download de arquivo...")
    download_path = "/tmp/downloaded_example.txt"
    download_file(bucket_name, "example.txt", download_path)
    
    # Exibir conteúdo do arquivo baixado
    with open(download_path, 'r') as f:
        content = f.read()
        print(f"   Conteúdo baixado:\n   {content}")
    
    # 6. Deletar objeto (opcional - descomente se quiser testar)
    # print("\n6. Removendo objeto...")
    # delete_object(bucket_name, "hello.txt")
    
    print("\n" + "=" * 60)
    print("✓ Todos os exemplos foram executados!")
    print("=" * 60)

if __name__ == "__main__":
    main()
