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

  async getAvailableChatbots(userId: number): Promise<Chatbot[]> {
    const friends = await this.usersService.getFriends(userId);
    const friendIds = friends.map((friend) => friend.id);
    const query = this.chatbotRepository
      .createQueryBuilder('chatbot')
      .where('chatbot.isPublic = :isPublic', { isPublic: true })
      .orWhere('chatbot.ownerId = :userId', { userId });

    if (friendIds.length > 0) {
      query.orWhere('chatbot.ownerId IN (:...friendIds)', { friendIds });
    }

    const chatbots = await query.getMany();
    return chatbots;
  }

  async getChatbotById(chatbotId: number): Promise<Chatbot> {
    return this.chatbotRepository.findOne(chatbotId);
  }
}
