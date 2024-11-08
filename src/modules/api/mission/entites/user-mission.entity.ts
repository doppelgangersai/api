import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum MissionStatus {
  STARTED = 'started',
  COMPLETED = 'completed',
  FAILED = 'failed',
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
    default: MissionStatus.STARTED,
    nullable: true,
  })
  status: MissionStatus;
}
