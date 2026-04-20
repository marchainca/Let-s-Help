import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Activity } from './activity.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'Activities_tracking' })
export class ActivityTracking {
  @PrimaryGeneratedColumn()
  IdTracking: number;

  @Column({ name: 'IdActivity' })
  IdActivity: number;

  @Column({ name: 'IdUser' })
  IdUser: number;

  @Column({ type: 'int', nullable: true, name: 'ActualAttendees' })
  ActualAttendees: number;

  @Column({ type: 'int', nullable: true, name: 'ExecutedActivities' })
  ExecutedActivities: number;

  @Column({ type: 'int', nullable: true, name: 'PlannedActivities' })
  PlannedActivities: number;

  @Column({ type: 'int', nullable: true, name: 'ProjectedAttendees' })
  ProjectedAttendees: number;

  @Column({ type: 'int', nullable: true, name: 'WeekNumber' })
  WeekNumber: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'CreatedAt' })
  CreatedAt: Date;

  @ManyToOne(() => Activity, activity => activity.activityTrackings)
  @JoinColumn({ name: 'IdActivity' })
  activity: Activity;

  @ManyToOne(() => User, user => user.activityTrackings)
  @JoinColumn({ name: 'IdUser' })
  user: User;
}