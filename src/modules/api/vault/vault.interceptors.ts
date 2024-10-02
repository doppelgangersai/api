import { createS3FileInterceptor } from '../../storage/s3-file.interceptor';

export const VaultFileInterceptor = createS3FileInterceptor({
  allowedMimeTypes: ['application/zip', 'application/x-zip-compressed'],
});
