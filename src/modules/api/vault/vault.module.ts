import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';

@Module({
  imports: [],
  controllers: [
    VaultController
  ],
  providers: [],
  exports: [],
})
export class VaultModule {}