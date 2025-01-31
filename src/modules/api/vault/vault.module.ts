import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { TelegramController } from './telegram/telegram.controller'; // Import TelegramController
import { ConfigModule } from '../../config';
import { StorageModule } from '../../storage/storage.module';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user';
import { InstagramParserModule } from '../../parsers/instagram/instagram-parser.module';
import { VaultEmitter } from './vault.emitter';
import { TelegramService } from './telegram/telegram.service';
import { AIModule } from '../../ai/ai.module';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { PointsModule } from '../../points/points.module';
import { VaultTwitterAuthController } from './twitter/vault-twitter-auth.controller';
import { VaultTwitterAuthService } from './twitter/vault-twitter-auth.service';
import { TwitterHandler } from './twitter/vault-twitter.handlers';
import { TwitterModule } from '../twitter/twitter.module'; // Import TelegramService

@Module({
  imports: [
    StorageModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    InstagramParserModule,
    AIModule,
    ChatbotModule,
    PointsModule,
    TwitterModule,
  ],
  controllers: [
    VaultController,
    TelegramController,
    VaultTwitterAuthController,
  ], // Add TelegramController
  providers: [
    VaultEmitter,
    TelegramService,
    VaultTwitterAuthService,
    TwitterHandler,
  ],
  exports: [VaultEmitter, VaultTwitterAuthService],
})
export class VaultModule {}
