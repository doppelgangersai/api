import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { TUserID } from '../user/user.types';

export type TAgentID = number;
class AgentDto {
  @ApiProperty({ description: 'ID of the agent' })
  id: number;

  @ApiProperty({ description: 'Creator ID of the agent' })
  creatorId: TUserID;

  @ApiProperty({ description: 'Owner ID of the agent' })
  ownerId: TUserID;

  @ApiProperty({ description: 'Linked Twitter account ID' })
  twitter_account_id: string;

  @ApiProperty({ description: 'Whether comments are enabled' })
  comments_enabled: boolean;
}
class PostSettingsDto {
  @ApiProperty({ description: 'Whether posting is enabled' })
  enabled: boolean;

  @ApiProperty({ description: 'List of accounts for posting' })
  accounts: string[];

  @ApiProperty({ description: 'Keywords for posting' })
  keywords: string[];

  @ApiProperty({ description: 'Prompt for posting' })
  prompt: string;
}

class CommentSettingsDto {
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

class UpdateAgentDto {
  @ApiPropertyOptional({ description: 'Creator ID of the agent' })
  creatorId?: TUserID;

  @ApiPropertyOptional({ description: 'Owner ID of the agent' })
  ownerId?: TUserID;

  @ApiPropertyOptional({ description: 'Twitter account linked to the agent' })
  twitter_account_id?: number;

  @ApiPropertyOptional({ description: 'Whether comments are enabled' })
  comments_enabled?: boolean;

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
  @Get(':agentId')
  @ApiOperation({ summary: '[mock] Get Agent Data' })
  @ApiParam({ name: 'agentId', type: Number, description: 'ID of the agent' })
  @ApiResponse({
    status: 200,
    description:
      'Agent data fetched successfully. *Notice:* `agent` object can contain additional data from `chatbot`',
    type: GetAgentResponseDto,
  })
  getAgentData(@Param('agentId') agentId: number): GetAgentResponseDto {
    return {
      agent: {
        id: typeof agentId !== 'number' ? parseInt(agentId) : agentId,
        creatorId: 7,
        ownerId: 7,
        twitter_account_id: 'twitter_account_id_1',
        comments_enabled: true,
      },
      post_settings: {
        enabled: true,
        accounts: ['elonmusk', 'NearProtocol'],
        keywords: ['keyword1', 'keyword2'],
        prompt: 'Prompt for posting',
      },
      comment_settings: {
        enabled: true,
        accounts: ['elonmusk', 'NearProtocol'],
        reply_when_tagged: true,
        x_accounts_replies: true,
        my_accounts_replies: true,
        prompt: 'Prompt for comments',
        min_followers: 1000,
        older_then: 7,
      },
    };
  }

  @Patch(':agentId')
  @ApiOperation({ summary: '[mock] Update Agent Data' })
  @ApiParam({ name: 'agentId', type: Number, description: 'ID of the agent' })
  @ApiBody({ type: UpdateAgentDto })
  @ApiResponse({
    status: 200,
    description: 'Agent data updated successfully.',
    type: UpdateAgentResponseDto,
  })
  updateAgentData(
    @Param('agentId') agentId: TAgentID,
    @Body() body: UpdateAgentDto,
  ): UpdateAgentResponseDto {
    return {
      agent: {
        id: typeof agentId !== 'number' ? parseInt(agentId) : agentId,
        ...body,
      },
    };
  }
}
