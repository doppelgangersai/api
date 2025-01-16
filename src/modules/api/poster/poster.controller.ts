import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PosterService } from './poster.service';
import {
  ApiBearerAuth,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OptionalAuthGuard } from '../../../core/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User } from '../user';
import { TChatbotID } from '../chatbot/chatbot.entity';

export class TweetDto {
  @ApiProperty({ description: 'The tweet content' })
  tweet: string;
}

@ApiTags('poster')
@Controller('api/poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}

  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  @Post()
  async parseAndPostByUser(@CurrentUser() user: User) {
    return this.posterService.parseAndPostByUser(user);
  }

  @Post('tweet')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  async tweet(@Body() body: TweetDto, @CurrentUser() user: User) {
    console.log(body, user);
    const tweet = body.tweet;
    console.log(`Tweeting: ${tweet}`, user);
    return this.posterService.tweet(user, tweet);
  }

  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({ status: 200, description: 'Get poster variants' })
  @Get('variants')
  async getVariants(@CurrentUser() user: User) {
    console.log(user);
    return this.posterService.getVariants(user);
  }

  @ApiParam({ name: 'chatbotId', type: Number })
  @Post(':chatbotId')
  async postByChatbotId(@Param('chatbotId') chatbotId: TChatbotID) {
    return this.posterService.parseAndPostByChatbot(chatbotId);
  }
}
