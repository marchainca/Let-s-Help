import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Absence } from '../../users/entities/absence.entity';

@Entity('Activities')
export class Activity {
  @PrimaryGeneratedColumn()
  IdActivity: number;

  @Column({ type: 'int' })
  IdUser: number;

  @Column({ type: 'varchar', length: 250 })
  NameActivity: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => User, user => user.activities)
  @JoinColumn({ name: 'IdUser' })
  user: User;

  @OneToMany(() => Absence, absence => absence.activity)
  absences: Absence[];
}