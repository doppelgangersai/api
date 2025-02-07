import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Post,
  Delete,
  HttpCode,
} from '@nestjs/common';
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

@ApiTags('chatbot')
@Controller('api/chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}
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

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get private chatbots: isPublic !== true, userId = user.id?',
  })
  @ApiResponse({
    status: 200,
    description: 'List of private chatbots',
    type: [Chatbot],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('private')
  async getPrivateChatbots(@CurrentUser() user: User): Promise<Chatbot[]> {
    return this.chatbotService.getPrivateChatbots(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get private chatbots: isPublic !== true, userId = user.id?',
  })
  @ApiResponse({
    status: 200,
    description: 'List of private chatbots',
    type: [Chatbot],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('premerged')
  async getPremergedChatbots(@CurrentUser() user: User): Promise<Chatbot[]> {
    return this.chatbotService.getPremergedChatbots(user.id);
  }

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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete chatbot' })
  @ApiParam({ name: 'chatbotId', description: 'ID of the chatbot' })
  @ApiResponse({ status: 200, description: 'Soft-deleted chatbot' })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':chatbotId')
  async softDeleteChatbot(
    @Param('chatbotId') chatbotId: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.chatbotService.softDeleteChatbot(chatbotId, user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a previously soft-deleted chatbot' })
  @ApiParam({ name: 'chatbotId', description: 'ID of the chatbot' })
  @ApiResponse({ status: 200, description: 'Restored chatbot' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post('restore/:chatbotId')
  async restoreChatbot(
    @Param('chatbotId') chatbotId: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.chatbotService.restoreChatbot(chatbotId, user.id);
  }
}
