import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../entities/user.entity';

@Entity('Roles')
export class Role {
  @PrimaryGeneratedColumn()
  IdRole: number;

  @Column({ type: 'varchar', length: 100 })
  NameRole: string;

  @Column({ type: 'varchar', length: 250 })
  Description: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @OneToMany(() => User, user => user.role)
  users: User[];
}