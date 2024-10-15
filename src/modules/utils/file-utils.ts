import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileUtils {
  parseJsonFile<T>(filePath: string): T | null {
    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(rawData) as T;
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
      return null;
    }
  }

  readFileAsBuffer(filePath: string): Buffer {
    return fs.readFileSync(filePath);
  }

  processDirectory(
    directoryPath: string,
    processFile: (filePath: string) => void,
  ): void {
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      if (fs.lstatSync(filePath).isDirectory()) {
        this.processDirectory(filePath, processFile);
      } else {
        processFile(filePath);
      }
    });
  }
}
