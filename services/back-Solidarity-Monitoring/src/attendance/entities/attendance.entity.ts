import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Beneficiary } from '../../beneficiary/entities/beneficiary.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { User } from '../../users/entities/user.entity';
import { Absence } from '../../users/entities/absence.entity'; // Ajusta la ruta según tu proyecto

@Entity('Attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  IdAttendance: number;

  @Column({ type: 'int' })
  IdBeneficiary: number;

  @Column({ type: 'int' })
  IdActivity: number;

  @Column({ type: 'date' })
  AttendanceDate: Date;

  @Column({ type: 'varchar', length: 20, default: 'present' })
  Status: string; // 'present', 'absent', 'justified', 'late'

  @Column({ type: 'time', nullable: true })
  CheckInTime: string;

  // Esta columna se usa solo cuando Status = 'absent'
  @Column({ type: 'int', nullable: true })
  IdAbsence: number;

  @Column({ type: 'int', nullable: true })
  CreatedBy: number;

  @CreateDateColumn({ type: 'timestamp' })
  CreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  UpdatedAt: Date;

  // Relaciones
  @ManyToOne(() => Beneficiary, beneficiary => beneficiary.attendances)
  @JoinColumn({ name: 'IdBeneficiary' })
  beneficiary: Beneficiary;

  @ManyToOne(() => Activity, activity => activity.attendances)
  @JoinColumn({ name: 'IdActivity' })
  activity: Activity;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'CreatedBy' })
  createdByUser: User;

  // Relación con la tabla Absences (opcional, solo cuando Status = 'absent')
  @ManyToOne(() => Absence, absence => absence.attendances)
  @JoinColumn({ name: 'IdAbsence' })
  absence: Absence;
}