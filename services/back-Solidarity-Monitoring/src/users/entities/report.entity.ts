import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Beneficiary } from '../../recognition/entities/beneficiary.entity';
import { ReportsTranslation } from 'src/common/translation/entities/reports-translation.entity';

@Entity('Reports')
export class Report {
  @PrimaryGeneratedColumn()
  IdReport: number;

  @Column({ type: 'int' })
  IdUser: number;

  @Column({ type: 'int' })
  IdBeneficiary: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => User, user => user.reports)
  @JoinColumn({ name: 'IdUser' })
  user: User;

  @ManyToOne(() => Beneficiary, beneficiary => beneficiary.reports)
  @JoinColumn({ name: 'IdBeneficiary' })
  beneficiary: Beneficiary;

  @OneToMany(() => ReportsTranslation, translation => translation.report)
  translations: ReportsTranslation[];
}