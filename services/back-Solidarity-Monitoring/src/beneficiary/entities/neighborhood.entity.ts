import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { City } from './city.entity';
import { Address } from './address.entity';

@Entity('Neighborhoods')
export class Neighborhood {
  @PrimaryGeneratedColumn()
  IdNeighborhood: number;

  @Column({ type: 'int' })
  IdCity: number;

  @Column({ type: 'varchar', length: 250 })
  NameNeighborhood: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => City, city => city.neighborhoods)
  @JoinColumn({ name: 'IdCity' })
  city: City;

  @OneToMany(() => Address, address => address.neighborhood)
  addresses: Address[];
}