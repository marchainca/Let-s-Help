import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SubProgram } from './sub-program.entity';
import { User } from '../../users/entities/user.entity';

@Entity('Tasks')
export class Task {
  @PrimaryGeneratedColumn()
  IdTask: number;

  @Column({ type: 'int' })
  IdSubProgram: number;

  @Column({ type: 'varchar', length: 250 })
  NameTask: string;

  @Column({ type: 'int', nullable: true })
  IdAssignedTo: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => SubProgram, subProgram => subProgram.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'IdSubProgram' })
  subProgram: SubProgram;

  @ManyToOne(() => User, user => user.tasks, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'IdAssignedTo' })
  assignedTo: User;
}