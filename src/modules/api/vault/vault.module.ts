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
import { TwitterAuthController } from './twitter/twitter-auth.controller';
import { TwitterAuthService } from './twitter/twitter-auth.service';
import { TwitterHandler } from './twitter/twitter.handlers'; // Import TelegramService

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
  ],
  controllers: [VaultController, TelegramController, TwitterAuthController], // Add TelegramController
  providers: [
    VaultEmitter,
    TelegramService,
    TwitterAuthService,
    TwitterHandler,
  ],
  exports: [VaultEmitter, TwitterAuthService],
})
export class VaultModule {}
