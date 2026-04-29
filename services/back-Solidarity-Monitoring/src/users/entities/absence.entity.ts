import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Beneficiary } from '../../beneficiary/entities/beneficiary.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';

@Entity('Absences')
export class Absence {
  @PrimaryGeneratedColumn()
  IdAbsence: number;

  @Column({ type: 'int' })
  IdUser: number;

  @Column({ type: 'int' })
  IdBeneficiary: number;

  @Column({ type: 'int' })
  IdActivity: number;

  @Column({ type: 'text', nullable: true })
  DescriptionAbsence: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => User, user => user.absences)
  @JoinColumn({ name: 'IdUser' })
  user: User;

  @ManyToOne(() => Beneficiary, beneficiary => beneficiary.absences)
  @JoinColumn({ name: 'IdBeneficiary' })
  beneficiary: Beneficiary;

  @ManyToOne(() => Activity, activity => activity.absences)
  @JoinColumn({ name: 'IdActivity' })
  activity: Activity;

  @OneToMany(() => Attendance, attendance => attendance.absence)
  attendances: Attendance[];
}