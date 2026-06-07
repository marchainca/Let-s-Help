import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Activity } from '../../../activities/entities/activity.entity';
import { Language } from './language.entity';

@Entity('ActivitiesTranslations')
export class ActivitiesTranslation {
  @PrimaryGeneratedColumn()
  IdTranslation: number;

  @Column({ type: 'int' })
  IdActivity: number;

  @Column({ type: 'int' })
  IdLanguage: number;

  @Column({ type: 'varchar', length: 250 })
  NameActivity: string;

  @ManyToOne(() => Activity, activity => activity.translations)
  @JoinColumn({ name: 'IdActivity' })
  activity: Activity;

  @ManyToOne(() => Language, language => language.activityTranslations)
  @JoinColumn({ name: 'IdLanguage' })
  language: Language;
}