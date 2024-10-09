import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { Readable } from 'stream';
import * as multer from 'multer';

const storage = multer.memoryStorage();

interface ICreateFileInterceptorInterface {
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  bucket?: string;
}

function createS3FileInterceptor({
  allowedMimeTypes,
  maxFileSize,
  bucket,
}: ICreateFileInterceptorInterface): Type<NestInterceptor> {
  @Injectable()
  class S3FileInterceptor implements NestInterceptor {
    constructor(private readonly storageService: StorageService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();

      const upload = multer({
        storage,
        limits: { fileSize: maxFileSize || 2048 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
          if (
            file &&
            allowedMimeTypes &&
            !allowedMimeTypes.includes(file.mimetype)
          ) {
            callback(null, false);
            throw new BadRequestException('Invalid file type');
          } else {
            callback(null, true);
          }
        },
      }).any();

      return new Observable((observer) => {
        upload(request, null, async (err) => {
          if (err) {
            observer.error(new BadRequestException(err.message));
            return;
          }

          if (request.files) {
            const uploadPromises = request.files.map(async (file) => {
              const fileStream = Readable.from(file.buffer);
              const fileSize = file.size;
              const mimeType = file.mimetype;
              const userId = request.user.id;
              const originalName = file.originalname;

              const fileName = await this.storageService.uploadFileStream(
                fileStream,
                fileSize,
                mimeType,
                userId,
                originalName,
                bucket,
              );
              file.filename = fileName;
              return fileName;
            });

            try {
              await Promise.all(uploadPromises);
              observer.next(request);
            } catch (error) {
              observer.error(new BadRequestException(error.message));
            }
          } else {
            observer.next(request);
          }
          observer.complete();
        });
      }).pipe(
        switchMap(() => next.handle()),
        catchError((err) => {
          throw new BadRequestException(err.message);
        }),
      );
    }
  }

  return S3FileInterceptor;
}

export { createS3FileInterceptor };
