import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SubProgram } from '../../../activities/entities/sub-program.entity';
import { Language } from './language.entity';

@Entity('SubProgramsTranslations')
export class SubProgramsTranslation {
  @PrimaryGeneratedColumn()
  IdTranslation: number;

  @Column({ type: 'int' })
  IdSubProgram: number;

  @Column({ type: 'int' })
  IdLanguage: number;

  @Column({ type: 'varchar', length: 100 })
  NameSubProgram: string;

  @Column({ type: 'text', nullable: true })
  DescriptionSubProgram: string;

  @ManyToOne(() => SubProgram, subProgram => subProgram.translations)
  @JoinColumn({ name: 'IdSubProgram' })
  subProgram: SubProgram;

  @ManyToOne(() => Language, language => language.subProgramTranslations)
  @JoinColumn({ name: 'IdLanguage' })
  language: Language;
}