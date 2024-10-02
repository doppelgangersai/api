import { ApiProperty } from '@nestjs/swagger';

export class UsernameDTO {
  @ApiProperty({ required: true, example: 'johndoe' })
  username: string;
}
