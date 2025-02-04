import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TUserID } from '../user/user.types';
import {
  ICommentSettings,
  IPostSettings,
  IUpdateAgent,
} from './interfaces/update-agent.interface';
import { TAgentID } from './agent.controller';

class AgentDto {
  @ApiProperty({ description: 'ID of the agent' })
  id: number;

  @ApiProperty({ description: 'Creator ID of the agent' })
  creatorId: TUserID;

  @ApiProperty({ description: 'Owner ID of the agent' })
  ownerId: TUserID;

  @ApiProperty({ description: 'Linked Twitter account ID' })
  twitter_account_id: number;

  @ApiProperty({ description: 'Is experimental' })
  experimental: boolean;

  @ApiProperty({ description: 'Is enabled' })
  enabled: boolean;
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

  @ApiProperty({
    description: 'Whether to comment only on verified accounts',
    required: false,
  })
  verified_only: boolean;
}

export class UpdateAgentDto implements IUpdateAgent {
  @ApiPropertyOptional({ description: 'Twitter account linked to the agent' })
  twitter_account_id?: number;

  @ApiPropertyOptional({ description: 'Is enabled' })
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Is experimental' })
  experimental?: boolean;

  @ApiPropertyOptional({
    description: 'Settings for posts',
    type: PostSettingsDto,
  })
  post_settings?: PostSettingsDto;

  @ApiPropertyOptional({
    description: 'Settings for comments',
    type: CommentSettingsDto,
  })
  comment_settings?: CommentSettingsDto;
}

export class GetAgentResponseDto {
  @ApiProperty({ description: 'Agent details' })
  agent: AgentDto;

  @ApiProperty({ description: 'Posting settings' })
  post_settings: PostSettingsDto;

  @ApiProperty({ description: 'Comment settings' })
  comment_settings: CommentSettingsDto;
}

export class AgentResponseDto extends UpdateAgentDto {
  @ApiProperty({ description: 'ID of the agent' })
  id: TAgentID;
}

export class UpdateAgentResponseDto {
  @ApiProperty({
    description: 'Updated data of the agent',
    type: AgentResponseDto,
  })
  agent: Partial<AgentResponseDto>;
}
