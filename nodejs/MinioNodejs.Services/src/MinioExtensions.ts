import * as Minio from "minio";

export interface MinioConfig {
  endPoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  useSSL?: boolean;
}

export function createMinioClient(config: MinioConfig): Minio.Client {
  return new Minio.Client({
    endPoint: config.endPoint,
    port: config.port,
    useSSL: config.useSSL ?? false,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
  });
}
