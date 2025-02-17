import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MissionStatus } from '../types/mission.enums';

@Entity('user_missions')
export class UserMissionEntity {
  /**
   * Unique identifier for the user mission.
   * @type {number}
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Unique identifier for the mission.
   * @type {number}
   */
  @Column()
  missionId: number;

  /**
   * Unique identifier for the user.
   * @type {number}
   */
  @Column()
  userId: number;

  /**
   * Status of the mission.
   * @type {MissionStatus}
   */
  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.TODO,
    nullable: true,
  })
  status: MissionStatus;

  /**
   * Date when the mission was completed.
   * @type {Date}
   */
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;
}
