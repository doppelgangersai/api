import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TUserID } from '../../user/user.types';

export enum MissionStatus {
  TODO = 'todo',
  STARTED = 'started',
  REVIEW = 'review',
  DONE = 'done',
}

@Entity()
export class UserMissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  missionId: number;

  @Column()
  userId: TUserID; // be careful on type change

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.TODO,
    nullable: true,
  })
  status: MissionStatus;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;
}
