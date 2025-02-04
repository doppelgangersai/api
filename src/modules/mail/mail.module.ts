import { Module } from '@nestjs/common';
import { MandrillEmailService } from './mandrill-email.service';
import { ConfigModule } from 'modules/config';

@Module({
  imports: [ConfigModule],
  providers: [MandrillEmailService],
  exports: [MandrillEmailService],
})
export class MailModule {}