from io import BytesIO
from typing import BinaryIO

from minio import Minio

from ..interfaces.i_minio_service import IMinioService


class MinioService(IMinioService):
    def __init__(self, client: Minio) -> None:
        self._client = client

    def create_bucket(self, bucket_name: str) -> None:
        if not self._client.bucket_exists(bucket_name):
            self._client.make_bucket(bucket_name)

    def list_buckets(self) -> list[str]:
        return [b.name for b in self._client.list_buckets()]

    def bucket_exists(self, bucket_name: str) -> bool:
        return self._client.bucket_exists(bucket_name)

    def delete_bucket(self, bucket_name: str) -> None:
        self._client.remove_bucket(bucket_name)

    def upload_file(
        self,
        bucket_name: str,
        object_name: str,
        data: BinaryIO,
        length: int,
        content_type: str,
    ) -> None:
        self._client.put_object(bucket_name, object_name, data, length, content_type=content_type)

    def download_file(self, bucket_name: str, object_name: str) -> BytesIO:
        response = self._client.get_object(bucket_name, object_name)
        try:
            return BytesIO(response.read())
        finally:
            response.close()
            response.release_conn()
