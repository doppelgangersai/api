import { Injectable } from '@nestjs/common';
import { FileUtils } from './utils/file-utils';
import { ZipUtils } from './utils/zip-utils';
import * as path from 'path';
import { UserService } from '../../../api/user';
import { StorageService } from '../../../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { AIService } from '../../../ai/ai/ai.service';

interface Message {
  conversationId: string;
  timestampMs: number;
  senderName: string;
  content: string;
}

@Injectable()
export class InstagramParserService {
  constructor(
    private readonly fileUtils: FileUtils,
    private readonly zipUtils: ZipUtils,
    private readonly userService: UserService,
    private readonly storageService: StorageService,
    private readonly aiService: AIService,
  ) {}

  async parseUser(userId: number): Promise<void> {
    const user = await this.userService.get(userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log(`Parsing Instagram user: ${userId} - User: ${user.fullName}`);
    const uniqueIdentifier = uuidv4(); // Уникальный идентификатор для избежания коллизий в названиях файлов
    const zipFileName = `${uniqueIdentifier}_instagram_data.zip`; // Уникальное имя файла
    const zipFilePath = path.join('/tmp', zipFileName); // Путь к файлу архива
    const outputDir = path.join('/tmp', `${uniqueIdentifier}_instagram_data`); // Уникальная директория для распаковки

    try {
      await this.storageService.downloadFile(
        'user-' + userId,
        user.instagramFile,
        zipFilePath,
      );
      console.log('Download complete, starting to extract ZIP...');
      await this.zipUtils.extractZip(zipFilePath, outputDir); // Убедитесь, что метод корректно обрабатывает путь

      const personalInfo = await this.parsePersonalInfo(outputDir);
      const posts = await this.parsePosts(outputDir);
      const comments = await this.parsePostComments(outputDir);
      const reelsComments = await this.parseReelsComments(outputDir);
      const inbox = await this.parseInbox(outputDir);

      const backstory = await this.aiService.getProfileDescription(
        personalInfo,
        posts,
        comments,
        reelsComments,
        inbox,
      );
      user.backstory = backstory;
      await this.userService.update(userId, user);
      console.log('AI generated description:', backstory);
    } catch (error) {
      console.error('Error processing user data:', error);
    } finally {
      this.cleanup(outputDir, zipFilePath);
    }
  }

  async cleanup(directory: string, zipFile: string): Promise<void> {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.unlinkSync(zipFile);
  }

  async parsePersonalInfo(
    outputDir: string,
  ): Promise<{ [key: string]: string }> {
    const filePath = path.join(
      outputDir,
      'personal_information/personal_information/personal_information.json',
    );
    const personalInfoData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const profileUser = personalInfoData.profile_user[0];
    const stringMapData = profileUser.string_map_data;

    const personalInfo: { [key: string]: string } = {};
    for (const key in stringMapData) {
      const item = stringMapData[key];
      personalInfo[key.replace(/\s+/g, '')] = item.value || ''; // Normalize keys and handle null values
    }

    return personalInfo;
  }

  private decode(text: string): string {
    if (!text) return ''; // Handle null or undefined
    try {
      return decodeURIComponent(escape(text));
    } catch (e) {
      console.error('Decode error:', e);
      return text; // Return original text if decoding fails
    }
  }

  private getMostFrequentSender(messages: Message[]): string {
    const senderFrequency = messages.reduce((acc, message) => {
      acc[message.senderName] = (acc[message.senderName] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.keys(senderFrequency).reduce((a, b) =>
      senderFrequency[a] > senderFrequency[b] ? a : b,
    );
  }

  async parseInbox(outputDir: string): Promise<string[]> {
    const inboxDir = path.join(
      outputDir,
      'your_instagram_activity/messages/inbox',
    );
    const allMessages: Message[] = [];
    this.fileUtils.processDirectory(inboxDir, (filePath) => {
      const conversation = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (conversation && conversation.messages) {
        conversation.messages.forEach((msg) => {
          allMessages.push({
            conversationId: uuidv4(),
            timestampMs: msg.timestamp_ms,
            senderName: msg.sender_name,
            content: this.decode(msg.content),
          });
        });
      }
    });

    const mostFrequentSender = this.getMostFrequentSender(allMessages);
    const outgoingMessages = allMessages.filter(
      (msg) => msg.senderName === mostFrequentSender,
    );
    return outgoingMessages.map((msg) => msg.content);
  }

  async parsePostComments(outputDir: string): Promise<string[]> {
    const filePath = path.join(
      outputDir,
      'your_instagram_activity/comments/post_comments_1.json',
    );
    const commentsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return commentsData.map((comment: any) =>
      this.decode(comment.string_map_data.Comment.value),
    );
  }

  async parseReelsComments(outputDir: string): Promise<string[]> {
    const filePath = path.join(
      outputDir,
      'your_instagram_activity/comments/reels_comments.json',
    );
    const commentsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return commentsData.comments_reels_comments.map((comment: any) =>
      this.decode(comment.string_map_data.Comment.value),
    );
  }

  async parsePosts(outputDir: string): Promise<string[]> {
    const filePath = path.join(
      outputDir,
      'your_instagram_activity/content/posts_1.json',
    );
    const postData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return postData
      .filter((post) => post.title && post.title.trim() !== '')
      .map((post) => this.decode(post.title));
  }
}
