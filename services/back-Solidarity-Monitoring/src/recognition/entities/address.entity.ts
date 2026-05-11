import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { City } from './city.entity';
import { Neighborhood } from './neighborhood.entity';
import { Beneficiary } from './beneficiary.entity';

@Entity('Address')
export class Address {
  @PrimaryGeneratedColumn()
  IdAddress: number;

  @Column({ type: 'int' })
  IdCity: number;

  @Column({ type: 'int' })
  IdNeighborhood: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  Street: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Number: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  PostalCode: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => City, city => city.addresses)
  @JoinColumn({ name: 'IdCity' })
  city: City;

  @ManyToOne(() => Neighborhood, neighborhood => neighborhood.addresses)
  @JoinColumn({ name: 'IdNeighborhood' })
  neighborhood: Neighborhood;

  @OneToMany(() => Beneficiary, beneficiary => beneficiary.address)
  beneficiaries: Beneficiary[];
}