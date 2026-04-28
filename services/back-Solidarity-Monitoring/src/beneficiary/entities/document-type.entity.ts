import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Beneficiary } from './beneficiary.entity';

@Entity('DocumentTypes')
export class DocumentType {
  @PrimaryGeneratedColumn()
  IdDocumentType: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  Name: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  Description: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  // Relación inversa: un tipo de documento puede tener muchos beneficiarios
  @OneToMany(() => Beneficiary, beneficiary => beneficiary.documentType)
  beneficiaries: Beneficiary[];
}