import { forwardRef, Module } from '@nestjs/common';
import { InstagramParserService } from './services/instagram-parser.service';
import { FileUtils, ZipUtils } from '../../utils';
import { UserModule } from '../../api/user';
import { StorageModule } from '../../storage/storage.module';
import { InstagramParserHandler } from './handlers/instagram-parser.handler';
import { AIModule } from '../../ai/ai.module';
import { VaultModule } from '../../api/vault/vault.module';

@Module({
  providers: [
    InstagramParserService,
    FileUtils,
    ZipUtils,
    InstagramParserHandler,
  ],
  exports: [InstagramParserService],
  imports: [UserModule, StorageModule, AIModule, forwardRef(() => VaultModule)],
})
export class InstagramParserModule {}
