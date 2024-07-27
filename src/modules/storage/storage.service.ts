import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { extname } from 'path';
import { Readable } from 'stream';
import { ConfigService } from 'modules/config';

@Injectable()
export class StorageService {
  private readonly minioClient: Client;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: this.configService.getInt('MINIO_PORT'),
      useSSL: this.configService.getBoolean('MINIO_USE_SSL'),
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
  }

  async createBucketIfNotExists(bucketName: string): Promise<void> {
    console.log('checking bucket', bucketName);
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    console.log('bucketExists', bucketExists);
    if (!bucketExists) {
      console.log('creating bucket', bucketName);
      await this.minioClient.makeBucket(bucketName, 'us-east-1');
    }
  }

  async uploadFile(
    stream: Readable,
    fileSize: number,
    mimeType: string,
    userId: string,
    originalName: string,
    bucket?: string,
  ): Promise<string> {
    const fileExt = extname(originalName);
    const fileName = bucket
      ? `${userId}_${Date.now()}${fileExt}`
      : `${Date.now()}${fileExt}`;
    const bucketName = bucket || `user-${userId}`;

    await this.createBucketIfNotExists(bucketName).catch((e) => {
      console.log('Creation error:', e);
    });

    await this.minioClient
      .putObject(bucketName, fileName, stream, fileSize, {
        'Content-Type': mimeType,
      })
      .catch((e) => console.log(e.message));

    console.log('Put', fileName, 'V');

    return fileName;
  }
}
