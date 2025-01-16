import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TUserID } from '../api/user/user.types';

export type TPointTransactionID = number;

@Entity()
export class PointsTransaction {
  @PrimaryGeneratedColumn()
  id: TPointTransactionID;

  @Column({
    nullable: true,
  })
  fromUserId?: TUserID;

  @Column({
    nullable: true,
  })
  toUserId?: TUserID;

  @Column()
  amount: number;

  @Column()
  type: string;

  @Column({
    nullable: true,
  })
  message: string;
}
