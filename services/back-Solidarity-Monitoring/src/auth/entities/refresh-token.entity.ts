import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('RefreshTokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  IdRefreshToken: number;

  @Column({ type: 'int' })
  IdUser: number;

  @Column({ type: 'varchar', length: 512, unique: true })
  Token: string;

  @Column({ type: 'timestamp' })
  ExpiresAt: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'IdUser' })
  user: User;
}
