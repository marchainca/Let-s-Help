import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Beneficiary } from '../../recognition/entities/beneficiary.entity';

@Entity('Reports')
export class Report {
  @PrimaryGeneratedColumn()
  IdReport: number;

  @Column({ type: 'int' })
  IdUser: number;

  @Column({ type: 'int' })
  IdBeneficiary: number;

  @Column({ type: 'text' })
  DescriptionReport: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => User, user => user.reports)
  @JoinColumn({ name: 'IdUser' })
  user: User;

  @ManyToOne(() => Beneficiary, beneficiary => beneficiary.reports)
  @JoinColumn({ name: 'IdBeneficiary' })
  beneficiary: Beneficiary;
}