import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PosterService } from './poster.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OptionalAuthGuard } from '../../../core/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User } from '../user';

@ApiTags('poster')
@Controller('api/poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}

  @UseGuards(OptionalAuthGuard)
  @Post()
  async post(@CurrentUser() user: User) {
    return this.posterService.parseAndPostByUser(user?.id || 1);
  }

  @ApiParam({ name: 'chatbotId', type: Number })
  @Post(':chatbotId')
  async postByChatbotId(@Param('chatbotId') chatbotId: number) {
    return this.posterService.parseAndPostByChatbot(chatbotId);
  }
}
