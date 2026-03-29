import os

from minio import Minio


def create_minio_client() -> Minio:
    return Minio(
        f"{os.getenv('MINIO_ENDPOINT', 'localhost')}:{os.getenv('MINIO_PORT', '9000')}",
        access_key=os.getenv("MINIO_ACCESS_KEY", "DWnAxhH812XRcTBPWXA4"),
        secret_key=os.getenv("MINIO_SECRET_KEY", "FIBwo0raitlamHBnk2nNihdx88xoqeFD6793e3yi"),
        secure=os.getenv("MINIO_USE_SSL", "false").lower() == "true",
    )
