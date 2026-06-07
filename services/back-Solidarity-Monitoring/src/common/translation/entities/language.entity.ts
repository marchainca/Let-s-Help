import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolesTranslation } from './roles-translation.entity';
import { ProgramsTranslation } from './programs-translation.entity';
import { AbsencesTranslation } from './absences-translation.entity';
import { ActivitiesTranslation } from './activities-translation.entity';
import { SubProgramsTranslation } from './subprograms-translation.entity';

@Entity('Languages')
export class Language {
  @PrimaryGeneratedColumn()
  IdLanguage: number;

  @Column({ type: 'varchar', length: 2, unique: true })
  Code: string; // 'es', 'en'

  @Column({ type: 'varchar', length: 50 })
  Name: string;

  @OneToMany(() => RolesTranslation, translation => translation.language)
  roleTranslations: RolesTranslation[];

  @OneToMany(() => ProgramsTranslation, translation => translation.language)
  programTranslations: ProgramsTranslation[];

  @OneToMany(() => AbsencesTranslation, translation => translation.language)
  absenceTranslations: AbsencesTranslation[];

  @OneToMany(() => ActivitiesTranslation, translation => translation.language)
  activityTranslations: ActivitiesTranslation[];

  @OneToMany(() => SubProgramsTranslation, translation => translation.language)
  subProgramTranslations: SubProgramsTranslation[];

}