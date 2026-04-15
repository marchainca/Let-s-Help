import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { State } from './state.entity';
import { Neighborhood } from './neighborhood.entity';
import { Address } from './address.entity';

@Entity('Cities')
export class City {
  @PrimaryGeneratedColumn()
  IdCity: number;

  @Column({ type: 'int' })
  IdState: number;

  @Column({ type: 'varchar', length: 250 })
  NameCity: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => State, state => state.cities)
  @JoinColumn({ name: 'IdState' })
  state: State;

  @OneToMany(() => Neighborhood, neighborhood => neighborhood.city)
  neighborhoods: Neighborhood[];

  @OneToMany(() => Address, address => address.city)
  addresses: Address[];
}