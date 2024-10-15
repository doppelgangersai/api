import * as unzipper from 'unzipper';
import * as archiver from 'archiver';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZipUtils {
  async extractZip(filePath: string, outputDir: string): Promise<void> {
    await fs
      .createReadStream(filePath)
      .pipe(unzipper.Extract({ path: outputDir }))
      .promise();
  }

  /**
   * Creates a ZIP archive from the contents of the provided directory.
   * @param sourceDir The directory to archive.
   * @param zipFilePath The path where the ZIP file will be created.
   */
  async createZip(sourceDir: string, zipFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      output.on('close', () => {
        console.log(`Zip file ${zipFilePath} has been created successfully.`);
        resolve();
      });

      archive.on('error', (err) => {
        console.error('Error creating zip file:', err);
        reject(err);
      });

      archive.pipe(output);

      archive.directory(sourceDir, false);

      archive.finalize();
    });
  }
}
