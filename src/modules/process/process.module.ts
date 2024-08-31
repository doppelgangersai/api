import { Module } from '@nestjs/common';
import { InstagramParserModule } from '../parsers/instagram/instagram-parser.module';
import { ProcessService } from './process.service';

@Module({
  imports: [InstagramParserModule],
  providers: [ProcessService],
})
export class ProcessModule {}
