import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from '../../../users/entities/report.entity';
import { Language } from '../entities/language.entity'

@Entity('ReportsTranslations')
export class ReportsTranslation {
  @PrimaryGeneratedColumn()
  IdTranslation: number;

  @Column({ type: 'int' })
  IdReport: number;

  @Column({ type: 'int' })
  IdLanguage: number;

  @Column({ type: 'text' })
  DescriptionReport: string;

  @ManyToOne(() => Report, report => report.translations)
  @JoinColumn({ name: 'IdReport' })
  report: Report;

  @ManyToOne(() => Language)
  @JoinColumn({ name: 'IdLanguage' })
  language: Language;
}