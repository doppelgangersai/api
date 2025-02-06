import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AgentService } from './agent.service';
import { User } from '../user';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import {
  GetAgentResponseDto,
  UpdateAgentDto,
  UpdateAgentResponseDto,
} from './agent.dtos';
import { Chatbot } from '../chatbot/chatbot.entity';

export type TAgentID = number;

@ApiTags('Agents')
@Controller('api/agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':agentId')
  @ApiOperation({ summary: 'Get Agent Data' })
  @ApiParam({ name: 'agentId', type: Number, description: 'ID of the agent' })
  @ApiResponse({
    status: 200,
    description:
      'Agent data fetched successfully. *Notice:* `agent` object can contain additional data from `chatbot`',
    type: GetAgentResponseDto,
  })
  getAgentData(
    @Param('agentId') agentId: number,
    @CurrentUser() user: User,
  ): Promise<GetAgentResponseDto> {
    return this.agentService.getAgentSettings(agentId, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':agentId')
  @ApiOperation({ summary: 'Update Agent Data' })
  @ApiParam({ name: 'agentId', type: Number, description: 'ID of the agent' })
  @ApiBody({ type: UpdateAgentDto })
  @ApiResponse({
    status: 200,
    description: 'Agent data updated successfully.',
    type: UpdateAgentResponseDto,
  })
  updateAgentData(
    @Param('agentId') agentId: TAgentID,
    @Body()
    body: UpdateAgentDto,
    @CurrentUser() user: User,
  ): Promise<GetAgentResponseDto> {
    return this.agentService.updateAgentSettings(agentId, user.id, body);
  }

  @Get('test/tick')
  async testTick() {
    await this.agentService.tick();
    return { message: 'Tick done' };
  }

  @Post('debug/user/:userId')
  async debugUser(@Param('userId') userId: number) {
    await this.agentService.processAgentsByUserId(userId);
  }

  @Post('debug/agent/:agentId')
  async debugAgent(@Param('agentId') agentId: number) {
    await this.agentService.processAgentById(agentId);
  }

  // agents to post (list): 200, just return list to debug
  @ApiOperation({ summary: 'Create chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Agent/Chatbot',
    type: [Chatbot],
  })
  @Get('debug/list')
  async debugList() {
    return await this.agentService.getAgentsToPost();
  }
}
