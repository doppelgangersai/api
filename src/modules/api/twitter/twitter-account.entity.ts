import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { TUserID } from '../user/user.types';

@Entity()
export class TwitterAccount {
  @PrimaryGeneratedColumn()
  @ApiResponseProperty()
  id: number;

  @Column()
  user_id?: TUserID;

  @ApiProperty({
    description: 'Screen name of the Twitter account',
    required: false,
  })
  @Column({
    nullable: true,
  })
  screen_name?: string;

  @ApiProperty({ description: 'ID of the Twitter account', required: false })
  @Column({
    nullable: true,
  })
  twitter_id?: string;

  @ApiProperty({
    description: 'Refresh token for the Twitter account',
  })
  @Column({
    nullable: true,
    select: false,
  })
  refresh_token?: string;

  @ApiProperty({
    description: 'Access token for the Twitter account',
    required: false,
  })
  @Column({ nullable: true, select: false })
  access_token?: string;

  @Column({ nullable: true, select: false })
  access_token_expiry?: Date;
}
