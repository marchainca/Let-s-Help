import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Absence } from '../../users/entities/absence.entity';
import { ActivityTracking } from './activity-tracking.entity';
import { SubProgram } from './sub-program.entity';

@Entity('Activities')
export class Activity {
  @PrimaryGeneratedColumn()
  IdActivity: number;

  @Column({ type: 'int' })
  IdUser: number;

  @Column({ type: 'int' })
  IdProgram: number;

  @Column({ type: 'varchar', length: 250 })
  NameActivity: string;

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
  @JoinColumn({ name: 'IdSubProgram' })   // Esta es la única definición de la columna
  subProgram: SubProgram;
}