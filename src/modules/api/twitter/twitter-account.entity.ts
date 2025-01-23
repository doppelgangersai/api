import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { TUserID } from '../user/user.types';

@Entity()
export class TwitterAccount {
  @PrimaryGeneratedColumn()
  @ApiResponseProperty()
  id: number;

  @ApiProperty({ description: 'User ID of the Twitter account' })
  @Column()
  user_id?: TUserID;

  @ApiProperty({ description: 'Screen name of the Twitter account' })
  @Column()
  screen_name?: string;

  @ApiProperty({ description: 'ID of the Twitter account' })
  @Column()
  twitter_id?: number;

  @ApiProperty({ description: 'Refresh token for the Twitter account' })
  @Column()
  refresh_token?: string;
}
