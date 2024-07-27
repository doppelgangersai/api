import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { ConfigModule } from '../../config';
import { StorageModule } from '../../storage/storage.module';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user';

@Module({
  imports: [
    StorageModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule
  ],
  controllers: [
    VaultController
  ],
  providers: [],
  exports: [],
})
export class VaultModule {}