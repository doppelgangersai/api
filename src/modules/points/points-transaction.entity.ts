import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PointsTransaction {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    nullable: true,
  })
  fromUserId?: number;
  @Column({
    nullable: true,
  })
  toUserId?: number;
  @Column()
  amount: number;
  @Column()
  type: string;
  @Column({
    nullable: true,
  })
  message: string;
}
