import * as Minio from "minio";
import { Readable } from "stream";
import { IMinioService } from "../interfaces/IMinioService";

export class MinioService implements IMinioService {
  constructor(private readonly client: Minio.Client) {}

  async createBucket(bucketName: string): Promise<void> {
    const exists = await this.client.bucketExists(bucketName);
    if (!exists) {
      await this.client.makeBucket(bucketName);
    }
  }

  async listBuckets(): Promise<string[]> {
    const buckets = await this.client.listBuckets();
    return buckets.map((b) => b.name);
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    return this.client.bucketExists(bucketName);
  }

  async deleteBucket(bucketName: string): Promise<void> {
    await this.client.removeBucket(bucketName);
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    stream: Readable,
    size: number,
    contentType: string
  ): Promise<void> {
    await this.client.putObject(bucketName, objectName, stream, size, {
      "Content-Type": contentType,
    });
  }

  async downloadFile(bucketName: string, objectName: string): Promise<Readable> {
    return this.client.getObject(bucketName, objectName);
  }
}
