import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  // ApiResponseProperty,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChatbotService } from './chatbot.service';
import { Chatbot } from './chatbot.entity';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User } from '../user';

// export class MergeChatbotDto {
//   @ApiResponseProperty({
//     type: Chatbot,
//   })
//   chatbot: Chatbot;
// }

@ApiTags('chatbot')
@Controller('api/chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Merge chatbot' })
  // @ApiParam({ name: 'chatbotId', description: 'ID of the chatbot' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Merged',
  //   type: MergeChatbotDto,
  // })
  // @HttpCode(201)
  // @UseGuards(AuthGuard('jwt'))
  // @Post('merge/:chatbotId')
  // mergeChatbot(
  //   @Param('chatbotId') chatbotId: number,
  //   @CurrentUser() user: User,
  // ) {
  //   if (!user.chatbotId) {
  //     throw new NotAcceptableException('User has not chatbot');
  //   }
  //   console.log(
  //     '[controller] Merging chatbot:',
  //     chatbotId,
  //     user.chatbotId,
  //     user.id,
  //   );
  //   return this.chatbotService.merge(chatbotId, user.chatbotId, user.id);
  // }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chatbot by ID' })
  @ApiParam({ name: 'chatbotId', description: 'ID of the chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Chatbot',
    type: Chatbot,
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':chatbotId')
  async getChatbotById(
    @Param('chatbotId') chatbotId: number,
  ): Promise<Chatbot> {
    return this.chatbotService.getChatbotById(chatbotId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update chatbot' })
  @ApiParam({ name: 'chatbotId', description: 'ID of the chatbot' })
  @ApiBody({ type: Chatbot, description: 'Chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Updated chatbot',
    type: Chatbot,
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':chatbotId')
  async updateChatbot(
    @Param('chatbotId') chatbotId: number,
    @Body() chatbot: Chatbot,
  ): Promise<Chatbot> {
    return this.chatbotService.updateChatbot(chatbotId, chatbot);
  }

  // GET /api/chatbot/merged - isModified = true, userId = user.id?
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get merged chatbots: isModified = true, userId = user.id?',
  })
  @ApiResponse({
    status: 200,
    description: 'List of merged chatbots',
    type: [Chatbot],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('merged')
  async getMergedChatbots(@CurrentUser() user: User): Promise<Chatbot[]> {
    return this.chatbotService.getMergedChatbots(user.id);
  }
}
