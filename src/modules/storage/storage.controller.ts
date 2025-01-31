import { Controller, Get, Param, Res } from '@nestjs/common';
import { StorageService } from './storage.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('storage')
@Controller('api/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('avatars/:filename')
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const stream = await this.storageService.getFileStream('avatars', filename);
      stream.pipe(res);
    } catch (error) {
      res.status(404).send('Avatar not found');
    }
  }
} 