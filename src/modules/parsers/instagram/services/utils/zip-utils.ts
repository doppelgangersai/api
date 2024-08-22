import * as unzipper from 'unzipper';
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
}
