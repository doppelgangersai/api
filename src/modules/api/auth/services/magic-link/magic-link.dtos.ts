import { ApiProperty } from '@nestjs/swagger';

export class MagicLinkSendDTO {
  @ApiProperty({
    description: 'User email',
    example: 'webmaster@doppelgangers.ai',
  })
  email: string;
}

export class MagicLinkVerifyDTO {
  @ApiProperty({
    description: 'Magic link token',
    example: 'some-magic-link-token',
  })
  token: string;

  @ApiProperty({
    description: 'Magic link code',
    example: '123456',
  })
  code: string;

  @ApiProperty({
    description: 'Referrer id (userId)',
    example: 1,
  })
  ref: string;
}
