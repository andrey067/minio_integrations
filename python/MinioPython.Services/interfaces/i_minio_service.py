from abc import ABC, abstractmethod
from io import BytesIO
from typing import BinaryIO


class IMinioService(ABC):
    @abstractmethod
    def create_bucket(self, bucket_name: str) -> None: ...

    @abstractmethod
    def list_buckets(self) -> list[str]: ...

    @abstractmethod
    def bucket_exists(self, bucket_name: str) -> bool: ...

    @abstractmethod
    def delete_bucket(self, bucket_name: str) -> None: ...

    @abstractmethod
    def upload_file(
        self,
        bucket_name: str,
        object_name: str,
        data: BinaryIO,
        length: int,
        content_type: str,
    ) -> None: ...

    @abstractmethod
    def download_file(self, bucket_name: str, object_name: str) -> BytesIO: ...
