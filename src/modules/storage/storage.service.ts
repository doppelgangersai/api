import { Injectable } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, createReadStream } from 'fs';
import { Client } from 'minio';
import { extname, join, dirname } from 'path';
import { Readable } from 'stream';
import { ConfigService } from '../config';
import {
  MINIO_ACCESS_KEY,
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_SECRET_KEY,
  MINIO_USE_SSL,
} from '../../core/constants/environment.constants';

@Injectable()
export class StorageService {
  private readonly minioClient: Client;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Client({
      endPoint: this.configService.get(MINIO_ENDPOINT),
      port: this.configService.getInt(MINIO_PORT),
      useSSL: this.configService.getBoolean(MINIO_USE_SSL),
      accessKey: this.configService.get(MINIO_ACCESS_KEY),
      secretKey: this.configService.get(MINIO_SECRET_KEY),
    });
  }

  async createBucketIfNotExists(bucketName: string): Promise<void> {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(bucketName, 'us-east-1'); // TODO: make region configurable
    }
  }

  async uploadFileStream(
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
      console.log('Creation error:', e); // TODO: error handling
    });

    await this.minioClient
      .putObject(bucketName, fileName, stream, fileSize, {
        'Content-Type': mimeType,
      })
      .catch((e) => console.log(e.message)); // TODO: error handling

    return fileName;
  }

  /**
   * Downloads a file from the specified bucket and saves it locally.
   * Ensures the destination directory exists, creating it if necessary.
   * @param bucketName The name of the bucket where the file is stored.
   * @param objectName The name of the file in the bucket.
   * @param destinationPath The local path to save the file to.
   */
  async downloadFile(
    bucketName: string,
    objectName: string,
    destinationPath: string,
  ): Promise<void> {
    const destinationDir = dirname(destinationPath);
    if (!existsSync(destinationDir)) {
      mkdirSync(destinationDir, { recursive: true });
    }

    const fileStream = createWriteStream(destinationPath);

    try {
      const dataStream = await this.minioClient.getObject(
        bucketName,
        objectName,
      );
      dataStream.pipe(fileStream);
    } catch (e) {
      console.error(e.message);
    }
  }

  /**
   * Uploads a local file to the specified bucket in MinIO.
   * @param filePath The local path of the file to upload.
   * @param userId The user ID to associate the file with.
   * @param bucket The optional bucket name; if not provided, a user-specific bucket will be used.
   * @returns The name of the uploaded file.
   */
  async uploadFile(
    filePath: string,
    userId: string,
    bucket?: string,
  ): Promise<string> {
    const fileName = bucket
      ? `${userId}_${Date.now()}${extname(filePath)}`
      : `${Date.now()}${extname(filePath)}`;
    const bucketName = bucket || `user-${userId}`;

    await this.createBucketIfNotExists(bucketName).catch((e) => {
      console.log('Creation error:', e); // TODO: error handling
    });

    try {
      const fileStream = createReadStream(filePath);

      await this.minioClient.putObject(bucketName, fileName, fileStream);
      return fileName;
    } catch (e) {
      console.log('Upload error:', e.message); // TODO: error handling
      throw e; // rethrow the error after logging
    }
  }

  // TODO: remove?
  /**
   * Deletes a file from the specified bucket.
   * @param bucketName The name of the bucket where the file is stored.
   * @param objectName The name of the file to delete.
   */
  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, objectName);
  }

  async getFileStream(bucket: string, filename: string): Promise<Readable> {
    try {
      return await this.minioClient.getObject(bucket, filename);
    } catch (error) {
      throw new Error(`File not found in bucket ${bucket}: ${filename}`);
    }
  }
}
