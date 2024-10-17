import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { TelegramController } from './telegram/telegram.controller'; // Import TelegramController
import { ConfigModule } from '../../config';
import { StorageModule } from '../../storage/storage.module';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user';
import { InstagramParserModule } from '../../parsers/instagram/instagram-parser.module';
import { VaultEmitter } from './vault.emitter';
import { TelegramService } from './telegram/telegram.service'; // Import TelegramService

@Module({
  imports: [
    StorageModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    InstagramParserModule,
  ],
  controllers: [VaultController, TelegramController], // Add TelegramController
  providers: [VaultEmitter, TelegramService], // Add TelegramService
  exports: [VaultEmitter],
})
export class VaultModule {}
