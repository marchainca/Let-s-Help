import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Absence } from '../../../users/entities/absence.entity';
import { Language } from './language.entity';

@Entity('AbsencesTranslations')
export class AbsencesTranslation {
  @PrimaryGeneratedColumn()
  IdTranslation: number;

  @Column({ type: 'int' })
  IdAbsence: number;

  @Column({ type: 'int' })
  IdLanguage: number;

  @Column({ type: 'text', nullable: true })
  DescriptionAbsence: string;

  @ManyToOne(() => Absence, absence => absence.translations)
  @JoinColumn({ name: 'IdAbsence' })
  absence: Absence;

  @ManyToOne(() => Language, language => language.absenceTranslations)
  @JoinColumn({ name: 'IdLanguage' })
  language: Language;
}