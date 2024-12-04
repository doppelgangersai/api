import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  userId: number;

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.TODO,
    nullable: true,
  })
  status: MissionStatus;
}
