import { Injectable } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, createReadStream } from 'fs';
import { Client } from 'minio';
import { extname, join, dirname } from 'path';
import { Readable } from 'stream';
import { ConfigService } from '../config';

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
    console.log('Downloading', objectName, 'from bucket', bucketName);

    // Ensure the directory for the file exists, not the file itself
    const destinationDir = dirname(destinationPath);
    if (!existsSync(destinationDir)) {
      console.log('Destination directory does not exist, creating...');
      mkdirSync(destinationDir, { recursive: true });
      console.log('Directory created:', destinationDir);
    }

    const fileStream = createWriteStream(destinationPath);

    try {
      const dataStream = await this.minioClient.getObject(
        bucketName,
        objectName,
      );
      dataStream.pipe(fileStream);
      console.log('File downloaded successfully to', destinationPath);
    } catch (e) {
      console.log('Download error:', e);
      throw e; // rethrow the error after logging
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

    await this.createBucketIfNotExists(bucketName)
      .then(() => console.log(`Bucket ${bucketName} created`))
      .catch((e) => {
        console.log('Creation error:', e);
      });

    try {
      const fileStream = createReadStream(filePath);

      await this.minioClient.putObject(bucketName, fileName, fileStream);

      console.log(
        'File',
        fileName,
        'uploaded successfully to bucket',
        bucketName,
      );
      return fileName;
    } catch (e) {
      console.log('Upload error:', e.message);
      throw e; // rethrow the error after logging
    }
  }

  /**
   * Deletes a file from the specified bucket.
   * @param bucketName The name of the bucket where the file is stored.
   * @param objectName The name of the file to delete.
   */
  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    console.log('Deleting', objectName, 'from bucket', bucketName);
    await this.minioClient.removeObject(bucketName, objectName);
    console.log('File deleted successfully');
  }
}
