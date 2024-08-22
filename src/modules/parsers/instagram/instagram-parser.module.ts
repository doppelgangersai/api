import { Module } from '@nestjs/common';
import { InstagramParserService } from './services/instagram-parser.service';
import { FileUtils } from './services/utils/file-utils';
import { ZipUtils } from './services/utils/zip-utils';
import { UserModule } from '../../api/user';
import { StorageModule } from '../../storage/storage.module';
import { InstagramParserHandler } from './handlers/instagram-parser.handler';
import { AIModule } from '../../ai/ai/ai.module';

@Module({
  providers: [
    InstagramParserService,
    FileUtils,
    ZipUtils,
    InstagramParserHandler,
  ],
  exports: [InstagramParserService],
  imports: [UserModule, StorageModule, AIModule],
})
export class InstagramParserModule {}
