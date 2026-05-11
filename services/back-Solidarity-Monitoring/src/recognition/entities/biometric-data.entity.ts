import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Beneficiary } from './beneficiary.entity';

@Entity('Biometric_data')
export class BiometricData {
  @PrimaryGeneratedColumn()
  IdBiometric: number;

  @Column({ type: 'int' })
  IdBeneficiary: number;

  @Column({ type: 'bytea', nullable: true })
  binaryDescriptor: Buffer;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => Beneficiary, beneficiary => beneficiary.biometricData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'IdBeneficiary' })
  beneficiary: Beneficiary;
}