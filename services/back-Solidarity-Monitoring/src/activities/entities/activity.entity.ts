import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Absence } from '../../users/entities/absence.entity';
import { ActivityTracking } from './activity-tracking.entity';
import { SubProgram } from './sub-program.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { ActivitiesTranslation } from 'src/common/translation/entities/activities-translation.entity';

@Entity('Activities')
export class Activity {
  @PrimaryGeneratedColumn()
  IdActivity: number;

  @Column({ type: 'int' })
  IdUser: number;

  @Column({ type: 'int' })
  IdProgram: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => User, user => user.activities)
  @JoinColumn({ name: 'IdUser' })
  user: User;

  @OneToMany(() => Absence, absence => absence.activity)
  absences: Absence[];

  @OneToMany(() => ActivityTracking, tracking => tracking.activity)
  activityTrackings: ActivityTracking[];

  @ManyToOne(() => SubProgram, subProgram => subProgram.activities)
  @JoinColumn({ name: 'IdSubProgram' })
  subProgram: SubProgram;

  @OneToMany(() => Attendance, attendance => attendance.activity)
  attendances: Attendance[];

  @OneToMany(() => ActivitiesTranslation, translation => translation.activity)
  translations: ActivitiesTranslation[];
}