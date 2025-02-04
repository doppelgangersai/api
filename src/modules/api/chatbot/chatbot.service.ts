import { Injectable } from '@nestjs/common';
import { AIService } from '../../ai/ai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatbot } from './chatbot.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { UserService } from '../user';
import { TUserID } from '../user/user.types';
import { FilterService } from '../../filter/filter.service';
import { ChatbotSource } from './chatbot.types';

interface MessagesWithTitle {
  title: string;
  messages: string[];
}

@Injectable()
export class ChatbotService {
  constructor(
    private aiService: AIService,
    private usersService: UserService,
    private filterService: FilterService,

    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
  ) {}

  async createOrUpdateChatbotWithSameSource(
    messagesWithTitles: MessagesWithTitle[],
    userId: TUserID,
    source: ChatbotSource,
    twitterAccountId?: number,
  ): Promise<Chatbot> {
    const filteredMessages = await Promise.all(
      messagesWithTitles.map(async (message) => {
        const messages = await this.filterService.bulkFilter(message.messages);
        return {
          title: message.title,
          messages,
        };
      }),
    );

    const maxForBlock = Math.floor(50 / filteredMessages.length);
    const backstory = await this.aiService.getBackstoryByMessagesPack(
      messagesWithTitles,
      maxForBlock,
    );

    const user = await this.usersService.get(userId);

    console.log('SOURCE:', source);

    let chatbot = await this.chatbotRepository.findOne({
      where: {
        creatorId: userId,
        source,
      },
    });

    if (chatbot) {
      console.log('Chatbot with source', source, 'found. Updating.');
      console.log(
        'twitterAccountId',
        chatbot.twitterAccountId || twitterAccountId,
      );

      chatbot = await this.chatbotRepository.save({
        ...chatbot,
        backstory,
        twitterAccountId: chatbot.twitterAccountId || twitterAccountId,
      });

      console.log('chatbot', chatbot);

      return chatbot;
    }

    console.log('Chatbot with source', source, 'not found. Creating new one.');

    chatbot = await this.chatbotRepository.save({
      backstory,
      creatorId: userId,
      ownerId: userId,
      fullName: user.fullName,
      description: `Chatbot for ${user.fullName}`,
      avatar: user.avatar,
      isPublic: false,
      source,
      twitterAccountId,
    });

    const chatbotId = chatbot.id;
    await this.usersService.update(userId, {
      chatbotId,
    });

    return chatbot;
  }

  async createChatbot(
    messagesWithTitles: MessagesWithTitle[],
    userId: TUserID,
    source: ChatbotSource = ChatbotSource.UNKNOWN,
  ): Promise<Chatbot> {
    const filteredMessages = await Promise.all(
      messagesWithTitles.map(async (message) => {
        const messages = await this.filterService.bulkFilter(message.messages);
        return {
          title: message.title,
          messages,
        };
      }),
    );

    const maxForBlock = Math.floor(50 / filteredMessages.length);
    const backstory = await this.aiService.getBackstoryByMessagesPack(
      messagesWithTitles,
      maxForBlock,
    );

    const user = await this.usersService.get(userId);

    const chatbot = await this.chatbotRepository.save({
      backstory,
      creatorId: userId,
      ownerId: userId,
      fullName: user.fullName,
      description: `Chatbot for ${user.fullName}`,
      avatar: user.avatar,
      isPublic: false,
      source,
    });

    const chatbotId = chatbot.id;
    await this.usersService.update(userId, {
      chatbotId,
    });

    return chatbot;
  }

  /**
   * Get chatbots available to the user.
   * Includes public chatbots, user's own chatbots, and friends' chatbots.
   * @param userId - ID of the user
   * @returns Array of available chatbots
   */
  async getAvailableChatbots(userId: TUserID): Promise<Chatbot[]> {
    const friendsChatbots = await this.getFriendsChatbots(userId);

    const publicAndOwnChatbots = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .where('chatbot.isPublic = :isPublic', { isPublic: true })
      .getMany();

    const allChatbotsMap = new Map<number, Chatbot>();
    publicAndOwnChatbots.forEach((chatbot) =>
      allChatbotsMap.set(chatbot.id, chatbot),
    );
    friendsChatbots.forEach((chatbot) =>
      allChatbotsMap.set(chatbot.id, chatbot),
    );

    return Array.from(allChatbotsMap.values());
  }

  /**
   * Get chatbots where the owner is a friend of the user.
   * @param userId - ID of the user
   * @returns Array of friends' chatbots
   */
  async getFriendsChatbots(userId: TUserID): Promise<Chatbot[]> {
    const friends = await this.usersService.getFriends(userId);

    const friendIds = friends.map((friend) => friend.id);

    if (friendIds.length === 0) {
      return [];
    }

    return this.chatbotRepository
      .createQueryBuilder('chatbot')
      .where('chatbot.ownerId IN (:...friendIds)', { friendIds })
      .getMany();
  }

  async getChatbotById(chatbotId: number): Promise<Chatbot> {
    return this.chatbotRepository.findOne(chatbotId);
  }

  async mergeChatbots(chatbot1Id: number, chatbot2Id: number, userId: TUserID) {
    const chatbot1 = await this.getChatbotById(chatbot1Id);
    const chatbot2 = await this.getChatbotById(chatbot2Id);
    const backstory1 = chatbot1.backstory;
    const backstory2 = chatbot2.backstory;

    const backstory_prompt = `Merge two users backstories to one (like a hybrid/digital baby/...).
Create a new person backstory based on two provided backstories:
Backstory 1:
${backstory1}

Backstory 2:
${backstory2}`;

    const backstory = await this.aiService
      .processText(backstory_prompt)
      .catch(() => {
        return backstory_prompt;
      });

    const imagePrompt = await this.aiService
      .processText(`Create image generation prompt for a single person face, 500 characters max, based on backstory:
      ${backstory}
      
      Do not use names in response.
      
      Prompt:
      `);

    const img: string | null = (await this.aiService
      .generateImage(`${imagePrompt}`)
      .catch(() => null)) as string | null;

    const title = await this.aiService
      .processText(
        `Create a short simple title for chatbot based on backstory:
${backstory}

Title:`,
      )
      .catch(() => `Merge of ${chatbot1.fullName} & ${chatbot2.fullName}`);

    const description = await this.aiService
      .processText(
        `Create a simple description for chatbot based on backstory:
${backstory}

Title:`,
      )
      .catch(() => '');
    // todo: save image to s3
    console.log('img:', !!img);

    const chatbot = await this.chatbotRepository.save({
      backstory,
      ownerId: userId,
      creatorId: userId,
      merge1Id: chatbot1Id,
      merge2Id: chatbot2Id,
      fullName: `${chatbot1.fullName} & ${chatbot2.fullName}`,
      title,
      description,
      isPublic: false,
      ...(typeof img === 'string' ? { avatar: img } : {}),
    });

    return chatbot;
  }

  // deprecated
  async updateChatbot(
    chatbotId: number,
    chatbot: Partial<Chatbot>,
  ): Promise<Chatbot> {
    await this.chatbotRepository.update(chatbotId, {
      ...chatbot,
      isModified: true,
    });
    return this.getChatbotById(chatbotId);
  }

  async getMergedChatbots(userId: TUserID): Promise<Chatbot[]> {
    return this.chatbotRepository.find({
      where: {
        ownerId: userId,
        merge1Id: Not(IsNull()),
        merge2Id: Not(IsNull()),
        // isModified: true,
      },
    });
  }

  async getPrivateChatbots(userId: TUserID): Promise<Chatbot[]> {
    return this.chatbotRepository.find({
      where: {
        ownerId: userId,
        isPublic: false,
        merge1Id: null,
        merge2Id: null,
      },
      order: {
        id: 'DESC',
      },
      take: 1,
    });
  }

  async getPremergedChatbots(userId: TUserID): Promise<Chatbot[]> {
    return this.chatbotRepository.find({
      where: {
        ownerId: userId,
        isPublic: false,
      },
    });
  }

  async getDoppelgangerChatbot(userId: TUserID): Promise<Chatbot> {
    return this.chatbotRepository.findOne({
      where: {
        ownerId: userId,
        merge1Id: null,
        merge2Id: null,
      },
    });
  }

  async get(chatbotId: number): Promise<Chatbot> {
    return this.chatbotRepository.findOne(chatbotId);
  }

  /**
   * Soft delete a chatbot by ID, only if it belongs to the current user.
   * @param chatbotId - ID of the chatbot
   * @param userId - ID of the user performing the deletion
   */
  async softDeleteChatbot(chatbotId: number, userId: TUserID): Promise<void> {
    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id: chatbotId,
        ownerId: userId,
      },
    });

    if (!chatbot) {
      throw new Error(`Chatbot ${chatbotId} not found or not owned by user.`);
    }

    await this.chatbotRepository.softDelete(chatbotId);
  }

  /**
   * Restore a previously soft-deleted chatbot, only if it belongs to the current user.
   * @param chatbotId - ID of the chatbot
   * @param userId - ID of the user performing the restore
   */
  async restoreChatbot(chatbotId: number, userId: TUserID): Promise<void> {
    // Optionally, ensure the chatbot belongs to the user even though it’s soft deleted
    const chatbot = await this.chatbotRepository.findOne({
      where: {
        id: chatbotId,
        ownerId: userId,
      },
      withDeleted: true, // important to find soft-deleted records
    });

    if (!chatbot) {
      throw new Error(`Chatbot ${chatbotId} not found or not owned by user.`);
    }

    await this.chatbotRepository.restore(chatbotId);
  }

  async getAgentToPost() {
    // Calculate the timestamp for 15 minutes ago.
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Use the query builder for more complex conditions.
    return await this.chatbotRepository
      .createQueryBuilder('agent')
      .where('agent.agent_enabled = :enabled', { enabled: true })
      .andWhere(
        '(agent.post_enabled = :postEnabled OR agent.comment_enabled = :commentEnabled)',
        {
          postEnabled: true,
          commentEnabled: true,
        },
      )
      // Check that either no error is recorded or the last error is older than 15 minutes.
      .andWhere(
        'agent.last_agent_error IS NULL OR agent.last_agent_error < :fifteenMinutesAgo',
        {
          fifteenMinutesAgo,
        },
      )
      .getMany();
  }

  async resetAgentSession(chatbotId: number) {
    await this.chatbotRepository.update(chatbotId, {
      post_session_count: 0,
      comment_session_count: 0,
      agent_session_reset: new Date(),
    });
  }
}
