import { Injectable } from '@nestjs/common';
import { AIService } from '../../ai/ai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatbot } from './chatbot.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user';

interface MessagesWithTitle {
  title: string;
  messages: string[];
}

@Injectable()
export class ChatbotService {
  constructor(
    private aiService: AIService,
    private usersService: UserService,
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
  ) {}
  async createChatbot(
    messages: MessagesWithTitle[],
    userId: number,
  ): Promise<Chatbot> {
    const maxForBlock = Math.floor(50 / messages.length);
    const backstory = await this.aiService.getBackstoryByMessagesPack(
      messages,
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
    });

    const chatbotId = chatbot.id;

    console.log(`Created chatbot with id: ${chatbotId}`);
    await this.usersService.update(userId, {
      chatbotId,
    });

    console.log(`Chatbot service created with backstory: ${backstory}`);
    console.log(`Chatbot service created by user: ${userId}`);

    return chatbot;
  }

  /**
   * Get chatbots available to the user.
   * Includes public chatbots, user's own chatbots, and friends' chatbots.
   * @param userId - ID of the user
   * @returns Array of available chatbots
   */
  async getAvailableChatbots(userId: number): Promise<Chatbot[]> {
    // Get chatbots owned by friends
    const friendsChatbots = await this.getFriendsChatbots(userId);

    // Get public and user's own chatbots
    const publicAndOwnChatbots = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .where('chatbot.isPublic = :isPublic', { isPublic: true })
      //.orWhere('chatbot.ownerId = :userId', { userId })
      .getMany();

    // Combine results and remove duplicates
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
  async getFriendsChatbots(userId: number): Promise<Chatbot[]> {
    const friends = await this.usersService.getFriends(userId);

    const friendIds = friends.map((friend) => friend.id);

    // If the user has no friends, return an empty array
    if (friendIds.length === 0) {
      return [];
    }

    // Step 2: Retrieve chatbots where ownerId is in friendIds
    const friendsChatbots = await this.chatbotRepository
      .createQueryBuilder('chatbot')
      .where('chatbot.ownerId IN (:...friendIds)', { friendIds })
      .getMany();

    return friendsChatbots;
  }

  async getChatbotById(chatbotId: number): Promise<Chatbot> {
    return this.chatbotRepository.findOne(chatbotId);
  }

  async mergeChatbots(chatbot1Id: number, chatbot2Id: number, userId: number) {
    console.log(
      '[ChatbotService.mergeChatbots] Merging chatbots:',
      chatbot1Id,
      chatbot2Id,
      userId,
    );
    const chatbot1 = await this.getChatbotById(chatbot1Id);
    console.log('chatbot1:', !!chatbot1);
    const chatbot2 = await this.getChatbotById(chatbot2Id);
    console.log('chatbot2:', !!chatbot2);
    const backstory1 = chatbot1.backstory;
    console.log('backstory1:', !!backstory1);
    const backstory2 = chatbot2.backstory;
    console.log('backstory2:', !!backstory2);

    const backstory_prompt = `Merge two users backstories to one (like a hybrid/digital baby/...), create a new person backstory based on two provided backstories:
    Backstory 1:
    ${backstory1}
    
    Backstory 2:
    ${backstory2}`;

    const backstory = await this.aiService
      .processText(backstory_prompt)
      .catch(() => {
        console.log('Fallback to original prompt');
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

    console.log('chatbot:', !!chatbot);

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

  async getMergedChatbots(userId: number): Promise<Chatbot[]> {
    return this.chatbotRepository.find({
      where: {
        ownerId: userId,
        isModified: true,
      },
    });
  }

  async getPrivateChatbots(userId: number): Promise<Chatbot[]> {
    return this.chatbotRepository.find({
      where: {
        ownerId: userId,
        isPublic: false,
      },
    });
  }
}
