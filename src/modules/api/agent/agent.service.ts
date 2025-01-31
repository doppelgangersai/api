import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatbotService } from '../chatbot/chatbot.service';
import { IUpdateAgent } from './interfaces/update-agent.interface';

@Injectable()
export class AgentService {
  constructor(private readonly chatbotService: ChatbotService) {}

  async updateAgentSettings(
    agentId: number,
    userId: number,
    settings: IUpdateAgent,
  ) {
    const chatbot = await this.chatbotService.getChatbotById(agentId);
    if (!chatbot) {
      throw new NotFoundException('Agent not found');
    }

    if (chatbot.creatorId !== userId && chatbot.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this agent');
    }

    const {
      twitter_account_id,
      post_settings: {
        enabled: post_enabled,
        accounts: post_accounts,
        keywords: post_keywords,
        prompt: post_prompt,
        per_day: post_per_day,
      },
      comment_settings: {
        enabled: comment_enabled,
        accounts: comment_accounts,
        reply_when_tagged: comment_reply_when_tagged,
        x_accounts_replies: comment_x_accounts_replies,
        my_accounts_replies: comment_my_accounts_replies,
        prompt: comment_prompt,
        min_followers: comment_min_followers,
        older_then: comment_older_then,
      },
    } = settings;

    const updatedChatbot = await this.chatbotService.updateChatbot(agentId, {
      twitterAccountId: twitter_account_id,
      post_enabled,
      post_accounts,
      post_keywords,
      post_prompt,
      post_per_day,
      comment_enabled,
      comment_accounts,
      comment_reply_when_tagged,
      comment_x_accounts_replies,
      comment_my_accounts_replies,
      comment_prompt,
      comment_min_followers,
      comment_older_then,
    });

    return {
      agent: {
        comment_settings: {
          accounts: updatedChatbot.comment_accounts,
          enabled: updatedChatbot.comment_enabled,
          my_accounts_replies: updatedChatbot.comment_my_accounts_replies,
          min_followers: updatedChatbot.comment_min_followers,
          older_then: updatedChatbot.comment_older_then,
          prompt: updatedChatbot.comment_prompt,
          reply_when_tagged: updatedChatbot.comment_reply_when_tagged,
          x_accounts_replies: updatedChatbot.comment_x_accounts_replies,
        },
        creatorId: updatedChatbot.creatorId,
        id: agentId,
        ownerId: updatedChatbot.ownerId,
        post_settings: {
          accounts: updatedChatbot.post_accounts,
          enabled: updatedChatbot.post_enabled,
          keywords: updatedChatbot.post_keywords,
          per_day: updatedChatbot.post_per_day,
          prompt: updatedChatbot.post_prompt,
        },
        twitter_account_id: updatedChatbot.twitterAccountId,
      },
    };
  }

  async getAgentSettings(agentId: number, userId: number) {
    const chatbot = await this.chatbotService.getChatbotById(agentId);
    if (!chatbot) {
      throw new NotFoundException('Agent not found');
    }

    if (chatbot.creatorId !== userId && chatbot.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this agent');
    }

    return {
      agent: {
        id: agentId,
        creatorId: chatbot.creatorId,
        ownerId: chatbot.ownerId,
        twitter_account_id: chatbot.twitterAccountId,
      },
      comment_settings: {
        accounts: chatbot.comment_accounts,
        enabled: chatbot.comment_enabled,
        my_accounts_replies: chatbot.comment_my_accounts_replies,
        min_followers: chatbot.comment_min_followers,
        older_then: chatbot.comment_older_then,
        prompt: chatbot.comment_prompt,
        reply_when_tagged: chatbot.comment_reply_when_tagged,
        x_accounts_replies: chatbot.comment_x_accounts_replies,
      },
      post_settings: {
        accounts: chatbot.post_accounts,
        enabled: chatbot.post_enabled,
        keywords: chatbot.post_keywords,
        per_day: chatbot.post_per_day,
        prompt: chatbot.post_prompt,
      },
    };
  }
}
