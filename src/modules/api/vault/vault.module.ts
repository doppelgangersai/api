import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { ConfigModule } from '../../config';
import { StorageModule } from '../../storage/storage.module';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user';
import { InstagramParserModule } from '../../parsers/instagram/instagram-parser.module';
import { VaultEmitter } from './vault.emitter';

@Module({
  imports: [
    StorageModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    InstagramParserModule,
  ],
  controllers: [VaultController],
  providers: [VaultEmitter],
  exports: [],
})
export class VaultModule {}
