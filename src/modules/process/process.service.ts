import { Injectable } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { InstagramParserService } from '../parsers/instagram/services/instagram-parser.service';

@Injectable()
@Command({
  name: 'parse:instagram-inbox',
  description: 'Parse Instagram inbox from a ZIP file',
})
export class ProcessService extends CommandRunner {
  constructor(private readonly instagramParserService: InstagramParserService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const zipFilePath = options.input || 'default/path/to/inbox.zip';
    const outputDir = options.output || 'default/output/directory';

    // await this.instagramParserService.parseInbox(zipFilePath, outputDir);
  }

  @Option({
    flags: '-i, --input <path>',
    description: 'Path to the Instagram inbox ZIP file',
  })
  parseInput(val: string): string {
    return val;
  }

  @Option({
    flags: '-o, --output <path>',
    description: 'Path to the output directory',
  })
  parseOutput(val: string): string {
    return val;
  }
}
