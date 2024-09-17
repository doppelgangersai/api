import { Controller, Get, Post, UseGuards, Param, Body } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
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

@ApiTags('chat')
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat list' })
  @ApiResponse({ status: 200, description: 'List of chats', type: [ChatDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getChatList(@CurrentUser() user: User): Promise<ChatDto[]> {
    return this.chatService.getChatList(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available chats list' })
  @ApiResponse({ status: 200, description: 'List of chats', type: [ChatDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get('available')
  async getAvailableChatList(@CurrentUser() user: User): Promise<User[]> {
    return this.chatService.getAvailableChatList();
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message' })
  @ApiParam({ name: 'chatId', description: 'ID of the chat' })
  @ApiBody({ type: ChatMessageDto, description: 'Message content' })
  @ApiResponse({
    status: 201,
    description: 'Sent message',
    type: ChatMessageWithUserDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Post(':twinUserId/message')
  async sendMessage(
    @Param('twinUserId') twinUserId: number,
    @Body() message: ChatMessageDto,
    @CurrentUser() user: User,
  ): Promise<ChatMessageWithUserDto> {
    return this.chatService.processMessage(twinUserId, user.id, message.text);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('legacy/:userId/init')
  async initChat(@Param('userId') userId: string, @CurrentUser() user: User) {
    return this.chatService.initChat(parseInt(userId), user.id);
  }
}
