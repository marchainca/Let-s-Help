// programs-translation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Program } from '../../../activities/entities/program.entity';
import { Language } from './language.entity';

@Entity('ProgramsTranslations')
export class ProgramsTranslation {
  @PrimaryGeneratedColumn()
  IdTranslation: number;

  @Column({ type: 'int' })
  IdProgram: number;

  @Column({ type: 'int' })
  IdLanguage: number;

  @Column({ type: 'varchar', length: 100 })
  NameProgram: string;

  @Column({ type: 'text', nullable: true })
  DescriptionProgram: string;

  @ManyToOne(() => Program, program => program.translations)
  @JoinColumn({ name: 'IdProgram' })
  program: Program;

  @ManyToOne(() => Language, language => language.programTranslations)
  @JoinColumn({ name: 'IdLanguage' })
  language: Language;
}