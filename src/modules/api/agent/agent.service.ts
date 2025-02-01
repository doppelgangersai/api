import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatbotService } from '../chatbot/chatbot.service';
import { IUpdateAgent } from './interfaces/update-agent.interface';
import { TwitterAccountService } from '../twitter/twitter-account.service';
import { AIService } from '../../ai/ai.service';

@Injectable()
export class AgentService {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly twitterAccountService: TwitterAccountService,
    private readonly aiService: AIService,
  ) {}

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

  // get agent where 24 * 3600 * 1000 / post_per_day < now - post_last_time
  async getAgentToPost() {
    return this.chatbotService.getAgentToPost();
  }

  async post() {
    const agents = await this.getAgentToPost();
    console.log('Posting for agents', agents);
    for (const agent of agents) {
      // console.log('Posting for agent', agent.id);
      console.log('Posting for account', agent.twitterAccountId);
      try {
        const twitterAccount =
          await this.twitterAccountService.getAccountWithActualTokens(
            agent.twitterAccountId,
          );

        const options = {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + twitterAccount.access_token },
        };

        const timeline = await fetch(
          `https://api.x.com/2/users/${
            twitterAccount.twitter_id
          }/timelines/reverse_chronological?user.fields=connection_status,is_identity_verified,verified_type&expansions=author_id${
            agent.post_last_checked_tweet_id
              ? '&since_id=' + agent.post_last_checked_tweet_id
              : ''
          }`,
          options,
        )
          .then((response) => response.json())
          .catch((err) => console.error(err));

        if (timeline.status === 429) {
          console.log('Rate limit exceeded');
          return;
        }

        console.log(
          `Users in timeline: ${timeline.includes.users
            .map((user) => user.username)
            .join(', ')}`,
        );

        const includes_ids = timeline.includes.users
          .filter((user) => agent.post_accounts.includes(user.username))
          .map((user) => user.id);

        console.log('Includes ids:', includes_ids);

        const tweets = timeline.data
          .filter((tweet) => includes_ids.includes(tweet.author_id))
          .map((tweet) => ({
            ...tweet,
            author: timeline.includes.users.find(
              (user) => user.id === tweet.author_id,
            ),
          }));
        // .filter((tweet) => tweet.text.includes(agent.post_keywords))
        // .slice(0, agent.post_per_day);

        console.log('Tweets:', tweets);

        // fetch(
        //   'https://api.twitter.com/1.1/statuses/home_timeline.json?count=20',
        //   {
        //     method: 'GET',
        //     headers: {
        //       Authorization: 'Bearer ' + twitterAccount.access_token,
        //     },
        //   },
        // )
        //   .then((response) => {
        //     if (!response.ok) {
        //       throw new Error('Ошибка сети: ' + response.status);
        //     }
        //     return response.json();
        //   })
        //   .then((data) => {
        //     console.log('Полученные твиты:', data);
        //     // Здесь можно обработать полученные данные и отобразить их на странице
        //   })
        //   .catch((error) => {
        //     console.error('Ошибка запроса:', error);
        //   });

        // do the posting

        if (!!tweets.length) {
          const prompt = `${agent.backstory}
${
  !!agent.post_prompt
    ? `
User (as customer) added requirement:
${agent.post_prompt}`
    : ''
}

You will have a tweet on input and you will need to generate a single reply, which will be immediately automatically posted as a reply to the tweet.
Use language of tweet. Avoid hashtags.

${tweets[0].author.username} tweeted:
${tweets[0].text}

Reply:`;

          console.log(prompt);
          const replyText = await this.aiService.processText(prompt);
          await this.twitterAccountService.replyToTweet(
            twitterAccount.access_token,
            tweets[0].id,
            replyText + ' #ИИпростите',
          );
          console.log(replyText);
        }

        const post_last_checked_tweet_id = timeline.data[0].id;
        console.log('Last checked tweet id:', post_last_checked_tweet_id);
        agent.post_last_checked_tweet_id = post_last_checked_tweet_id;
        await this.chatbotService.updateChatbot(agent.id, agent);
      } catch (e) {
        console.error('Error posting:', e);
        agent.last_agent_error = new Date();
        agent.last_agent_error_message = e.message;
        await this.chatbotService.updateChatbot(agent.id, agent);
      }
    }
  }
}
