import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { MissionAction } from '../types/mission.enums';
import { IMission } from '../types/mission';

@Entity()
export class MissionEntity implements IMission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: MissionAction,
  })
  action: MissionAction;

  @Column()
  points: number;

  @Column({ nullable: true })
  link?: string;

  @Column({ nullable: true })
  iosLink?: string;

  @Column({ nullable: true })
  androidLink?: string;

  @Column()
  isRepeatable: boolean;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  platform?: 'android' | 'ios' | 'web';
}