import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Program } from './program.entity';
import { Task } from './task.entity';
import { Activity } from './activity.entity';
import { Absence } from './absence.entity';
import { Report } from './report.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  IdUser: number;

  @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
  Identification: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  Email: string;

  @Column({ type: 'date', nullable: true })
  Birthdate: Date;

  @Column({ type: 'varchar', length: 250, nullable: true })
  FirstName: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  LastName: string;

  @Column({ type: 'varchar', length: 250 })
  Password: string;

  @Column({ type: 'int' })
  IdRole: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  UrlImage: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => Role, role => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'IdRole' })
  role: Role;

  @OneToMany(() => Program, program => program.leadUser)
  programs: Program[];

  @OneToMany(() => Task, task => task.assignedTo)
  tasks: Task[];

  @OneToMany(() => Activity, activity => activity.user)
  activities: Activity[];

  @OneToMany(() => Absence, absence => absence.user)
  absences: Absence[];

  @OneToMany(() => Report, report => report.user)
  reports: Report[];
}