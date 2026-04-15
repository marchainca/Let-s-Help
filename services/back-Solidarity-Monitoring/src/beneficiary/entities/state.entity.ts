import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { City } from './city.entity';

@Entity('States')
export class State {
  @PrimaryGeneratedColumn()
  IdState: number;

  @Column({ type: 'varchar', length: 250 })
  NameState: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @OneToMany(() => City, city => city.state)
  cities: City[];
}