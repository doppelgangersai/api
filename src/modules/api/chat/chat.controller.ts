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
import { ChatDto, ChatMessageDto, ChatMessageWithUserDto } from './chat.dtos';

@ApiTags('chat')
@Controller('api/chat')
export class ChatController {
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat list' })
  @ApiResponse({ status: 200, description: 'List of chats', type: [ChatDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getChatList(): Promise<ChatDto[]> {
    return [
      {
        id: 1,
        title: 'Chat 1',
        messages: [
          {
            id: 1,
            text: 'Hello',
            from: {
              id: 1,
              fullName: 'John Doe',
              avatar: 'https://example.com/avatar.jpg',
            },
            createdAt: new Date(),
          },
        ],
      },
      {
        id: 2,
        title: 'Chat 2',
        messages: [
          {
            id: 1,
            text: 'Hello',
            from: {
              id: 1,
              fullName: 'John Doe',
              avatar: 'https://example.com/avatar.jpg',
            },
            createdAt: new Date(),
          },
        ],
      },
    ];
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
    @Param('chatId') chatId: string,
  ): Promise<ChatMessageWithUserDto[]> {
    return [
      {
        id: 1,
        text: 'Hello',
        from: {
          id: 1,
          fullName: 'John Doe',
          avatar: 'https://example.com/avatar.jpg',
        },
        createdAt: new Date(),
      },
      {
        id: 2,
        text: 'Hello',
        from: {
          id: 1,
          fullName: 'John Doe',
          avatar: 'https://example.com/avatar.jpg',
        },
        createdAt: new Date(),
      },
    ];
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
  @Post(':chatId/message')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() message: ChatMessageDto,
  ): Promise<ChatMessageWithUserDto> {
    return {
      id: 1,
      text: message.text,
      from: {
        id: 1,
        fullName: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      },
      createdAt: new Date(),
    };
  }
}
