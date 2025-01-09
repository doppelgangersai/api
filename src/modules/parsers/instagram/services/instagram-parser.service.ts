/* eslint-disable */

import { Injectable } from '@nestjs/common';
import { FileUtils, ZipUtils } from '../../../utils';
import * as path from 'path';
import { ConnectionStatus, UserService } from '../../../api/user';
import { StorageService } from '../../../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { MessagesWithTitle } from '../../../ai/ai.service';
import { InstagramMessage } from '../instagram-parser.types';
import { ChatbotService } from '../../../api/chatbot/chatbot.service';
import { TUserID } from '../../../api/user/user.types';

@Injectable()
export class InstagramParserService {
  constructor(
    private readonly fileUtils: FileUtils,
    private readonly zipUtils: ZipUtils,
    private readonly userService: UserService,
    private readonly storageService: StorageService,
    private readonly chatbotService: ChatbotService,
  ) {}

  async removePhotos(userId: TUserID): Promise<void> {
    const user = await this.userService.get(userId);
    if (!user) {
      return;
    }

    const uniqueIdentifier = uuidv4();
    const zipFileName = `${uniqueIdentifier}_instagram_data.zip`;
    const zipFilePath = path.join('/tmp', zipFileName);
    let outputDir = path.join('/tmp', `${uniqueIdentifier}_instagram_data`);

    try {
      // Скачиваем zip архив с данными
      await this.storageService.downloadFile(
        `user-${userId}`,
        user.instagramFile,
        zipFilePath,
      );
      await this.zipUtils.extractZip(zipFilePath, outputDir);

      const topLevelItems = fs.readdirSync(outputDir);
      if (
        topLevelItems.length === 1 &&
        fs.statSync(path.join(outputDir, topLevelItems[0])).isDirectory()
      ) {
        outputDir = path.join(outputDir, topLevelItems[0]);
      }

      this.fileUtils.processDirectory(outputDir, (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (
          ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi'].includes(
            ext,
          )
        ) {
          fs.unlinkSync(filePath);
        }
      });

      const newZipFileName = `${uniqueIdentifier}_filtered_instagram_data.zip`;
      const newZipFilePath = path.join('/tmp', newZipFileName);
      await this.zipUtils.createZip(outputDir, newZipFilePath);

      const uploadedFileName = await this.storageService.uploadFile(
        newZipFilePath,
        userId.toString(),
        `user-${userId}`,
      );

      if (uploadedFileName) {
        user.instagramFile = uploadedFileName;
        await this.userService.update(userId, user);
      } else {
      }
    } catch (error) {
    } finally {
      await this.cleanup(outputDir, zipFilePath);
    }
  }

  async parseUser(userId: TUserID): Promise<void> {
    const user = await this.userService.get(userId);
    if (!user) {
      return;
    }

    const uniqueIdentifier = uuidv4();
    const zipFileName = `${uniqueIdentifier}_instagram_data.zip`;
    const zipFilePath = path.join('/tmp', zipFileName);
    let outputDir = path.join('/tmp', `${uniqueIdentifier}_instagram_data`);

    try {
      await this.storageService.downloadFile(
        'user-' + userId,
        user.instagramFile,
        zipFilePath,
      );
      await this.zipUtils.extractZip(zipFilePath, outputDir);

      const topLevelItems = fs.readdirSync(outputDir);
      if (
        topLevelItems.length === 1 &&
        fs.statSync(path.join(outputDir, topLevelItems[0])).isDirectory()
      ) {
        outputDir = path.join(outputDir, topLevelItems[0]);
      }

      const personalInfo = await this.parsePersonalInfo(outputDir);
      const posts = await this.parsePosts(outputDir);
      const comments = await this.parsePostComments(outputDir);
      const reelsComments = await this.parseReelsComments(outputDir);
      const inbox = await this.parseInbox(outputDir);

      // const backstory = await this.aiService.getProfileDescription(
      //   personalInfo,
      //   posts,
      //   comments,
      //   reelsComments,
      //   inbox,
      // );

      // const backstory = await this.aiService.getBackstoryByMessagesPack([
      //   this.mapPersonalInfo(personalInfo),
      //   { title: 'Posts', messages: posts },
      //   { title: 'Comments', messages: comments },
      //   { title: 'Reels Comments', messages: reelsComments },
      //   { title: 'Inbox', messages: inbox },
      // ]);
      // user.backstory = backstory;
      // await this.userService.update(userId, user);
      const { backstory } = await this.chatbotService.createChatbot(
        [
          this.mapPersonalInfo(personalInfo),
          { title: 'Posts', messages: posts },
          { title: 'Comments', messages: comments },
          { title: 'Reels Comments', messages: reelsComments },
          { title: 'Inbox', messages: inbox },
        ],
        userId,
      );

      await this.userService.update(userId, {
        instagramConnectionStatus: ConnectionStatus.PROCESSED,
      });
    } catch (error) {
      console.error('Error processing user data:', error);
    } finally {
      await this.cleanup(outputDir, zipFilePath);
    }
  }

  async cleanup(directory: string, zipFile: string): Promise<void> {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.unlinkSync(zipFile);
  }

  async parsePersonalInfo(outputDir: string): Promise<Record<string, string>> {
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

  private mapPersonalInfo(
    personalInfo: Record<string, string>,
  ): MessagesWithTitle {
    return {
      title: 'Personal Information',
      messages: Object.entries(personalInfo).map(([key, value]) => {
        return `${key}: ${value}`;
      }),
    };
  }

  private decode(text: string): string {
    if (!text) return ''; // Handle null or undefined
    try {
      return decodeURIComponent(escape(text));
    } catch (e) {
      console.error('Decode error:', e);
      return text;
    }
  }

  private getMostFrequentSender(messages: InstagramMessage[]): string {
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
    const allMessages: InstagramMessage[] = [];

    this.fileUtils.processDirectory(inboxDir, (filePath) => {
      if (path.extname(filePath) === '.json') {
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

  parsePosts(outputDir: string): Promise<string[]> {
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
