import express, { Request, Response } from "express";
import multer from "multer";
import { MinioService, createMinioClient } from "minio-nodejs-services";

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const client = createMinioClient({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: parseInt(process.env.MINIO_PORT ?? "9000"),
  accessKey: process.env.MINIO_ACCESS_KEY ?? "DWnAxhH812XRcTBPWXA4",
  secretKey: process.env.MINIO_SECRET_KEY ?? "FIBwo0raitlamHBnk2nNihdx88xoqeFD6793e3yi",
});

const minioService = new MinioService(client);

app.post("/create-bucket", async (req: Request, res: Response) => {
  const { bucketName } = req.body as { bucketName: string };
  await minioService.createBucket(bucketName);
  res.status(201).send();
});

app.get("/list-buckets", async (_req: Request, res: Response) => {
  const buckets = await minioService.listBuckets();
  res.json(buckets);
});

app.delete("/delete-bucket/:bucketName", async (req: Request, res: Response) => {
  await minioService.deleteBucket(req.params.bucketName);
  res.status(204).send();
});

app.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  const { bucketName } = req.query as { bucketName: string };
  const file = req.file!;
  const { Readable } = await import("stream");
  const stream = Readable.from(file.buffer);
  await minioService.uploadFile(bucketName, file.originalname, stream, file.size, file.mimetype);
  res.json({ fileName: file.originalname });
});

app.get("/download/:bucketName/:fileName", async (req: Request, res: Response) => {
  const stream = await minioService.downloadFile(req.params.bucketName, req.params.fileName);
  res.setHeader("Content-Disposition", `attachment; filename="${req.params.fileName}"`);
  stream.pipe(res);
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`MinIO Node.js API rodando na porta ${PORT}`));
