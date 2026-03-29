import sys
from io import BytesIO
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

from MinioPython.Services import MinioService, create_minio_client

app = FastAPI(
    title="API de MinIO",
    version="v1",
    description="Gerenciamento de buckets no MinIO: criação, listagem, exclusão e upload/download de arquivos.",
)

_client = create_minio_client()
_service: MinioService = MinioService(_client)


@app.post("/create-bucket", status_code=201)
async def create_bucket(bucket_name: str) -> None:
    _service.create_bucket(bucket_name)


@app.get("/list-buckets")
async def list_buckets() -> list[str]:
    return _service.list_buckets()


@app.delete("/delete-bucket/{bucket_name}", status_code=204)
async def delete_bucket(bucket_name: str) -> None:
    if not _service.bucket_exists(bucket_name):
        raise HTTPException(status_code=404, detail="Bucket não encontrado")
    _service.delete_bucket(bucket_name)


@app.post("/upload")
async def upload(file: UploadFile, bucket_name: str = Query(...)) -> dict[str, str]:
    content = await file.read()
    _service.upload_file(
        bucket_name,
        file.filename or "upload",
        BytesIO(content),
        len(content),
        file.content_type or "application/octet-stream",
    )
    return {"fileName": file.filename or "upload"}


@app.get("/download/{bucket_name}/{file_name}")
async def download(bucket_name: str, file_name: str) -> StreamingResponse:
    data = _service.download_file(bucket_name, file_name)
    return StreamingResponse(
        data,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{file_name}"'},
    )
