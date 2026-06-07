import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../../users/entities/role.entity';
import { Language } from './language.entity';

@Entity('RolesTranslations')
export class RolesTranslation {
  @PrimaryGeneratedColumn()
  IdTranslation: number;

  @Column({ type: 'int' })
  IdRole: number;

  @Column({ type: 'int' })
  IdLanguage: number;

  @Column({ type: 'varchar', length: 100 })
  NameRole: string;

  @Column({ type: 'varchar', length: 250 })
  Description: string;

  @ManyToOne(() => Role, role => role.translations)
  @JoinColumn({ name: 'IdRole' })
  role: Role;

  @ManyToOne(() => Language, language => language.roleTranslations)
  @JoinColumn({ name: 'IdLanguage' })
  language: Language;
}