import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../entities/user.entity';
import { RolesTranslation } from 'src/common/translation/entities/roles-translation.entity';

@Entity('Roles')
export class Role {
  @PrimaryGeneratedColumn()
  IdRole: number;

  @Column({ type: 'varchar', length: 100 })
  NameRole: string;

  @Column({ type: 'varchar', length: 250 })
  Description: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @OneToMany(() => RolesTranslation, translation => translation.role)
  translations: RolesTranslation[];

  // Método para obtener la traducción de un rol en un idioma específico
  getTranslation(languageCode: string = 'es'): RolesTranslation | undefined {
    return this.translations?.find(t => t.language?.Code === languageCode);
  }
}