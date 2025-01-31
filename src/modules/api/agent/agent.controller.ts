import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TUserID } from '../user/user.types';
import { AuthGuard } from '@nestjs/passport';
import {
  ICommentSettings,
  IPostSettings,
  IUpdateAgent,
} from './interfaces/update-agent.interface';
import { AgentService } from './agent.service';
import { User } from '../user';
import { CurrentUser } from '../../common/decorator/current-user.decorator';

export type TAgentID = number;
class AgentDto {
  @ApiProperty({ description: 'ID of the agent' })
  id: number;

  @ApiProperty({ description: 'Creator ID of the agent' })
  creatorId: TUserID;

  @ApiProperty({ description: 'Owner ID of the agent' })
  ownerId: TUserID;

  @ApiProperty({ description: 'Linked Twitter account ID' })
  twitter_account_id: number;
}

class PostSettingsDto implements IPostSettings {
  @ApiProperty({ description: 'Whether posting is enabled' })
  enabled: boolean;

  @ApiProperty({ description: 'List of accounts for posting' })
  accounts: string[];

  @ApiProperty({ description: 'Keywords for posting' })
  keywords: string[];

  @ApiProperty({ description: 'Prompt for posting' })
  prompt: string;

  @ApiProperty({ description: 'Number of posts per day' })
  per_day: number;
}

class CommentSettingsDto implements ICommentSettings {
  @ApiProperty({ description: 'Whether commenting is enabled' })
  enabled: boolean;

  @ApiProperty({ description: 'List of accounts for commenting' })
  accounts: string[];

  @ApiProperty({ description: 'Whether to reply when tagged' })
  reply_when_tagged: boolean;

  @ApiProperty({ description: 'Whether to reply to other accounts' })
  x_accounts_replies: boolean;

  @ApiProperty({ description: 'Whether to reply to own accounts' })
  my_accounts_replies: boolean;

  @ApiProperty({ description: 'Prompt for commenting' })
  prompt: string;

  @ApiProperty({ description: 'Minimum follower count to allow commenting' })
  min_followers: number;

  @ApiProperty({
    description: 'Comment on posts older than this number of days',
  })
  older_then: number;
}

class GetAgentResponseDto {
  @ApiProperty({ description: 'Agent details' })
  agent: AgentDto;

  @ApiProperty({ description: 'Posting settings' })
  post_settings: PostSettingsDto;

  @ApiProperty({ description: 'Comment settings' })
  comment_settings: CommentSettingsDto;
}

class UpdateAgentDto implements IUpdateAgent {
  @ApiPropertyOptional({ description: 'Twitter account linked to the agent' })
  twitter_account_id?: number;

  @ApiPropertyOptional({ description: 'Settings for posts' })
  post_settings?: PostSettingsDto;

  @ApiPropertyOptional({ description: 'Settings for comments' })
  comment_settings?: CommentSettingsDto;
}

class AgentResponseDto extends UpdateAgentDto {
  @ApiProperty({ description: 'ID of the agent' })
  id: TAgentID;
}

class UpdateAgentResponseDto {
  @ApiProperty({ description: 'Updated data of the agent' })
  agent: AgentResponseDto;
}

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
  ): Promise<UpdateAgentResponseDto> {
    return this.agentService.updateAgentSettings(agentId, user.id, body);
  }
}
