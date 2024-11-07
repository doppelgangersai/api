import { Injectable } from '@nestjs/common';
import { AIService } from '../ai/ai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatbot } from './chatbot.entity';
import { Repository } from 'typeorm';
import { UserService } from '../api/user';

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
      .orWhere('chatbot.ownerId = :userId', { userId })
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
}
