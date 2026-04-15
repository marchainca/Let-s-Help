import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Program } from './program.entity';
import { Task } from '../../activities/entities/task.entity';

@Entity('Sub_Programs')
export class SubProgram {
  @PrimaryGeneratedColumn()
  IdSubProgram: number;

  @Column({ type: 'int' })
  IdProgram: number;

  @Column({ type: 'varchar', length: 100 })
  NameSubProgram: string;

  @Column({ type: 'text', nullable: true })
  DescriptionSubProgram: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => Program, program => program.subPrograms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'IdProgram' })
  program: Program;

  @OneToMany(() => Task, task => task.subProgram)
  tasks: Task[];
}