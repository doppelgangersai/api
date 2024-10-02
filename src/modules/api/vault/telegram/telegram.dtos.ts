import { ApiProperty } from '@nestjs/swagger';

export class TelegramAuthInitDTO {
  @ApiProperty({ description: 'Phone number to send the auth code to' })
  phone: string;
}

export class TelegramAuthCompleteDTO {
  @ApiProperty({ description: 'Received auth code' })
  code: string;

  @ApiProperty({ description: 'Phone number' })
  phone: string;

  @ApiProperty({ description: 'Password' })
  password?: string;
}
