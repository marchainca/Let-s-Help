import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Address } from './address.entity';
import { BiometricData } from './biometric-data.entity';
import { Absence } from './absence.entity';
import { Report } from './report.entity';

@Entity('Beneficiaries')
export class Beneficiary {
  @PrimaryGeneratedColumn()
  IdBeneficiary: number;

  @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
  Identification: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  Email: string;

  @Column({ type: 'date', nullable: true })
  Birthdate: Date;

  @Column({ type: 'varchar', length: 250, nullable: true })
  FirstName: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  LastName: string;

  @Column({ type: 'int', nullable: true })
  IdAddress: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  UrlImage: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => Address, address => address.beneficiaries, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'IdAddress' })
  address: Address;

  @OneToMany(() => BiometricData, biometric => biometric.beneficiary)
  biometricData: BiometricData[];

  @OneToMany(() => Absence, absence => absence.beneficiary)
  absences: Absence[];

  @OneToMany(() => Report, report => report.beneficiary)
  reports: Report[];
}