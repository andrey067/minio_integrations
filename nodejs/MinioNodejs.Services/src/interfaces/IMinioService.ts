import { Readable } from "stream";

export interface IMinioService {
  createBucket(bucketName: string): Promise<void>;
  listBuckets(): Promise<string[]>;
  bucketExists(bucketName: string): Promise<boolean>;
  deleteBucket(bucketName: string): Promise<void>;
  uploadFile(
    bucketName: string,
    objectName: string,
    stream: Readable,
    size: number,
    contentType: string
  ): Promise<void>;
  downloadFile(bucketName: string, objectName: string): Promise<Readable>;
}
