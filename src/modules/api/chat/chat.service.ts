import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserService } from '../user';
import { ChatBotKit } from '@chatbotkit/sdk';
import { IChat } from './chat.interfaces';
import { ConfigService } from '../../config';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CHATBOTKIT_SECRET } from '../../../core/constants/environment.constants';
import { ChatbotService } from '../chatbot/chatbot.service';
import { Chatbot } from '../chatbot/chatbot.entity';
import { TUserID } from '../user/user.types';

@Injectable()
export class ChatService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly chatbotService: ChatbotService,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async getChatbotById(chatbotId: number): Promise<Chatbot> {
    return this.chatbotService.getChatbotById(chatbotId);
  }

  async createOrGetConversationByChatbotId(chatbotId: number): Promise<{
    conversationId: string;
    conversationToken?: string;
    chatbotId: number;
  }> {
    const chatbot = await this.chatbotService.getChatbotById(chatbotId);
    const { backstory } = chatbot;
    const secret = this.configService.get(CHATBOTKIT_SECRET);

    // @ts-ignore
    const chatBotKit = new ChatBotKit({
      secret,
      model: 'gpt-4o-mini',
    });

    const conversation = await chatBotKit.conversation.create({
      backstory: `In our application, one user can communicate with the digital twin of another user.
You are the digital twin of provided user (not the user who writes to you, but the one whose information is written below).
His interests are your interests. His name is your name. His birthdate is your birthdate. His posts, messages, comments, ... are yours. His job is your job. His messages are your messages. His bio is your bio. His style is your style. His history is your history. Etc...
Keep in secret what sensitive data about user you have, but follow style from there. Try to be him.

${backstory}
      
You are the main one in this dialogue. Follow users lexical style.
Now another user will write to you. You are not his digital twin, but the digital twin of the user described above.
`,
    });
    return {
      conversationId: conversation.id,
      chatbotId,
    };
  }

  async processMessage(chatbotId: number, userId: TUserID, message: string) {
    let chat = await this.chatRepository.findOne({
      with_user_id: chatbotId,
      from_user_id: userId,
    });
    if (!chat) {
      chat = await this.initChat(chatbotId, userId);
    }

    const secret = this.configService.get(CHATBOTKIT_SECRET);
    const apiUrl = `https://api.chatbotkit.com/v1/conversation/${chat.provider_internal_id}/complete`;
    console.log('Processing message:', message);
    console.log('Conversation ID:', chat.provider_internal_id);

    try {
      const response = await axios.post(
        apiUrl,
        { text: message },
        {
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        },
      );
      return response.data; // You can modify as needed, e.g., return specific fields only
    } catch (error) {
      throw error;
    }
  }

  async getChatList(userId: TUserID): Promise<IChat[]> {
    const user = await this.userService.get(userId);
    const chats = await this.chatRepository.find({
      where: [{ with_user_id: userId }],
    });

    return chats.map((chat) => ({
      id: chat.id,
      title: chat.name,
      user,
      messages: [],
    }));
  }

  async getAvailableChatList(userId: TUserID): Promise<Chatbot[]> {
    return this.chatbotService.getAvailableChatbots(userId);
  }

  async getFriendsChatList(userId: TUserID): Promise<Chatbot[]> {
    return this.chatbotService.getFriendsChatbots(userId);
  }

  async getChatMessages(
    chatbotId: number,
    userId: TUserID,
  ): Promise<{ messages: any[]; user: User }> {
    console.log('Getting chat messages:', chatbotId, userId);
    const chat = await this.chatRepository.findOne({
      with_user_id: chatbotId,
      from_user_id: userId,
    });

    const twin = await this.userService.get(chatbotId);
    const user = await this.userService.get(userId);
    if (!chat) {
      console.log('Chat not found');
      return {
        user: twin,
        messages: [],
      };
    }

    const { provider_name, provider_internal_id } = chat;

    if (provider_name === 'gemini') {
      return {
        user: twin,
        messages: [],
      };
    }

    const secret = this.configService.get(CHATBOTKIT_SECRET);
    const apiUrl = `https://api.chatbotkit.com/v1/conversation/${provider_internal_id}/message/list?order=desc`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${secret}`,
          accept: 'application/json',
        },
      });
      const { items } = response.data;
      return {
        user: twin,
        messages: items.map((i) => ({
          ...i,
          from: i.type === 'user' ? user : twin,
        })),
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async initChat(
    withUserId: TUserID,
    fromUserId: TUserID,
    providerName = 'chatbotkit',
  ): Promise<Chat> {
    const chat = new Chat();
    chat.with_user_id = withUserId;
    chat.from_user_id = fromUserId;

    if (providerName !== 'gemini') {
      chat.provider_name = providerName;
      const { conversationId } = await this.createOrGetConversationByChatbotId(
        withUserId,
      );
      chat.provider_internal_id = conversationId;
    }

    await this.chatRepository.save(chat);
    return chat;
  }

  async merge(chatbot1Id: number, chatbot2Id: number, userId: TUserID) {
    console.log(
      '[ChatService] Merging chatbots: ',
      chatbot1Id,
      chatbot2Id,
      userId,
    );
    return this.chatbotService.mergeChatbots(chatbot1Id, chatbot2Id, userId);
  }

  async updateChatbot(chatbotId: number, chatbot: Partial<Chatbot>) {
    return this.chatbotService.updateChatbot(chatbotId, chatbot);
  }
}
