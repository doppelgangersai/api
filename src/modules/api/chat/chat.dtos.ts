import { ApiProperty } from '@nestjs/swagger';
import { IChat, IChatMessage, IChatMessageWithUser } from './chat.interfaces';
import { User } from '../user';

export class ChatMessageDto implements IChatMessage {
  @ApiProperty({ description: 'Unique identifier of the message' })
  id: number;

  @ApiProperty({ description: 'Text content of the message' })
  text: string;

  @ApiProperty({ description: 'Timestamp when the message was created' })
  createdAt: Date;
}

export class ChatMessageWithUserDto
  extends ChatMessageDto
  implements IChatMessageWithUser
{
  @ApiProperty({
    description: 'User who sent the message',
    type: () => User,
  })
  from: Partial<User>;
}

export class ChatDto implements IChat {
  @ApiProperty({ description: 'Unique identifier of the chat' })
  id: number;

  @ApiProperty({ description: 'Title of the chat' })
  title: string;

  @ApiProperty({
    description: 'List of messages in the chat',
    type: [ChatMessageWithUserDto],
  })
  messages: IChatMessageWithUser[];
}
