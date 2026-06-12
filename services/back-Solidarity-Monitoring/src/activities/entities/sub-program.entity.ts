import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Program } from './program.entity';
import { Activity } from './activity.entity';
import { SubProgramsTranslation } from 'src/common/translation/entities/subprograms-translation.entity';

@Entity('Sub_Programs')
export class SubProgram {
  @PrimaryGeneratedColumn()
  IdSubProgram: number;

  @Column({ type: 'int' })
  IdProgram: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => Program, program => program.subPrograms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'IdProgram' })
  program: Program;

  @OneToMany(() => Activity, activity => activity.subProgram)
  activities: Activity[];

  @OneToMany(() => SubProgramsTranslation, translation => translation.subProgram)
  translations: SubProgramsTranslation[];
}