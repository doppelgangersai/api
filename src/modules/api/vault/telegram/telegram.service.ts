import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TelegramClient, sessions, Api } from 'telegram';
import { ConfigService } from '../../../config';

const { StringSession } = sessions;

@Injectable()
export class TelegramService {
  private apiId: number;
  private apiHash: string;
  private clients: { [phone: string]: TelegramClient } = {}; // глобальное хранилище клиентов
  private readonly logger = new Logger(TelegramService.name);

  constructor(private configService: ConfigService) {
    this.apiId = parseInt(
      this.configService.get<string>('TELEGRAM_API_ID'),
      10,
    );
    this.apiHash = this.configService.get<string>('TELEGRAM_API_HASH');
  }

  private createClient(
    phone: string,
    sessionString: string = '',
  ): TelegramClient {
    const client = new TelegramClient(
      new StringSession(sessionString),
      this.apiId,
      this.apiHash,
      {
        connectionRetries: 5,
      },
    );
    this.clients[phone] = client;
    return client;
  }

  async sendAuthCode(phone: string): Promise<{ phoneCodeHash: string }> {
    // Если клиент уже существует для данного телефона, отключаем его и удаляем
    if (this.clients[phone]) {
      await this.removeClient(phone);
    }

    // Создаем нового клиента и сохраняем его в глобальном хранилище
    const client = this.createClient(phone);
    await client.connect();

    const result = await client.sendCode(
      { apiId: this.apiId, apiHash: this.apiHash },
      phone,
    );

    return { phoneCodeHash: result.phoneCodeHash };
  }

  async completeAuth(
    code: string,
    phone: string,
    phoneCodeHash: string,
    password?: string,
  ): Promise<string> {
    console.log({
      code,
      phone,
      phoneCodeHash,
      password,
    });

    const client = this.clients[phone]; // используем существующего клиента
    if (!client) {
      throw new BadRequestException(
        'Клиент для данного номера телефона не найден.',
      );
    }

    try {
      // Пытаемся выполнить вход с помощью кода
      console.log('Trying to sign in with code');

      const signInParams = {
        phoneNumber: phone,
        phoneCodeHash: phoneCodeHash,
        phoneCode: code,
      };

      console.log(signInParams);

      await client.invoke(new Api.auth.SignIn(signInParams));
    } catch (err) {
      if (err.errorMessage === 'SESSION_PASSWORD_NEEDED' && password) {
        console.log('Trying to sign in with password');
        // Завершаем авторизацию с использованием пароля
        await client.signInWithPassword(
          {
            apiId: this.apiId,
            apiHash: this.apiHash,
          },
          {
            password: async () => password,
            onError: (err) => {
              throw err;
            },
          },
        );
      } else {
        throw new BadRequestException(err?.message as string);
      }
    }

    // Сохраняем сессию
    const sessionString = `${client.session.save()}`;

    this.removeClient(phone); // удаляем клиента из хранилища после авторизации

    return sessionString;
  }

  async parseChats(sessionString: string): Promise<string[]> {
    const client = this.createClient('parse', sessionString);
    await client.connect();

    const dialogs = await client.getDialogs();
    const chats = [];

    for (const dialog of dialogs) {
      const messages = await client.iterMessages(dialog.id, { reverse: true });

      for await (const message of messages) {
        if (message.out) {
          const chatName = dialog.title || 'Unknown Chat/User';
          const formattedMessage = `To ${chatName}: ${
            message.message || 'Сообщение пустое'
          }`;
          chats.push(formattedMessage);
        }
      }
    }

    await client.disconnect();
    this.removeClient('parse');
    return chats;
  }

  // Метод для удаления клиента и обработки ошибок при disconnect
  private async removeClient(phone: string) {
    const client = this.clients[phone];
    if (client) {
      try {
        await client.disconnect();
        this.logger.log(`Client for phone ${phone} disconnected successfully.`);
      } catch (error) {
        this.logger.warn(
          `Error during disconnect for phone ${phone}: ${error.message}`,
        );
      } finally {
        delete this.clients[phone]; // удаляем клиента
        this.logger.log(`Client for phone ${phone} removed from cache.`);
      }
    } else {
      this.logger.warn(`No client found for phone ${phone} to disconnect.`);
    }
  }
}
