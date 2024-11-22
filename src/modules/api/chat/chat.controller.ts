import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Body,
  HttpCode,
  NotAcceptableException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  ChatDto,
  ChatMessageDto,
  ChatMessagesResponseDto,
  ChatMessageWithUserDto,
} from './chat.dtos';
import { ChatService } from './chat.service';
import { User } from '../user';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { Chatbot } from '../../chatbot/chatbot.entity';

export class MergeChatbotDto {
  @ApiResponseProperty({
    type: Chatbot,
  })
  chatbot: Chatbot;
}

@ApiTags('chat')
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Merge chatbot' })
  @ApiParam({ name: 'chatbotId', description: 'ID of the chatbot' })
  @ApiResponse({
    status: 201,
    description: 'Merged',
    type: MergeChatbotDto,
  })
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  @Post('merge/:chatbotId')
  mergeChatbot(
    @Param('chatbotId') chatbotId: number,
    @CurrentUser() user: User,
  ) {
    if (!user.chatbotId) {
      throw new NotAcceptableException('User has not chatbot');
    }
    console.log(
      '[controller] Merging chatbot:',
      chatbotId,
      user.chatbotId,
      user.id,
    );
    return this.chatService.merge(chatbotId, user.chatbotId, user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat list' })
  @ApiResponse({ status: 200, description: 'List of chats', type: [ChatDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getChatList(@CurrentUser() user: User): Promise<ChatDto[]> {
    return this.chatService.getChatList(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Discover chats' })
  @ApiResponse({ status: 200, description: 'List of chats', type: [Chatbot] })
  @UseGuards(AuthGuard('jwt'))
  @Get('available')
  async getAvailableChatList(@CurrentUser() user: User): Promise<Chatbot[]> {
    return this.chatService.getAvailableChatList(user.id);
  }

  // same for friends
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Friends' })
  @ApiResponse({
    status: 200,
    description: 'List of friends chatbots',
    type: [Chatbot],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('friends')
  async getFriendsChatList(@CurrentUser() user: User): Promise<Chatbot[]> {
    return this.chatService.getFriendsChatList(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat messages' })
  @ApiParam({ name: 'chatId', description: 'ID of the chat' })
  @ApiResponse({
    status: 200,
    description: 'Chat messages',
    type: [ChatMessageWithUserDto],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':chatId')
  async getChatMessages(
    @Param('chatId') twinUserId: number,
    @CurrentUser() user: User,
  ): Promise<ChatMessagesResponseDto> {
    return this.chatService.getChatMessages(twinUserId, user.id);
  }

  // get Chatbot by ID
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chatbot by ID' })
  @ApiParam({ name: 'chatbotId', description: 'ID of the chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Chatbot',
    type: Chatbot,
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('chatbot/:chatbotId')
  async getChatbotById(
    @Param('chatbotId') chatbotId: number,
  ): Promise<Chatbot> {
    return this.chatService.getChatbotById(chatbotId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message' })
  @ApiParam({ name: 'chatbotId', description: 'ID of the chat' })
  @ApiBody({ type: ChatMessageDto, description: 'Message content' })
  @ApiResponse({
    status: 201,
    description: 'Sent message',
    type: ChatMessageWithUserDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Post(':twinUserId/message')
  async sendMessage(
    @Param('twinUserId') chatbotId: number,
    @Body() message: ChatMessageDto,
    @CurrentUser() user: User,
  ): Promise<ChatMessageWithUserDto> {
    console.log('Sending message:', chatbotId, message.text, user.id);
    return this.chatService.processMessage(chatbotId, user.id, message.text);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('legacy/:userId/init')
  async initChat(@Param('userId') userId: string, @CurrentUser() user: User) {
    return this.chatService.initChat(parseInt(userId), user.id);
  }
}
