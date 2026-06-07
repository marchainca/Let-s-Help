import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubProgram } from '../../activities/entities/sub-program.entity';
import { ProgramsTranslation } from 'src/common/translation/entities/programs-translation.entity';

@Entity('Programs')
export class Program {
  @PrimaryGeneratedColumn()
  IdProgram: number;

  @Column({ type: 'int' })
  IdLeadUser: number;

  @Column({ type: 'varchar', length: 100 })
  NameProgram: string;

  @Column({ type: 'text', nullable: true })
  DescriptionProgram: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => User, user => user.programs)
  @JoinColumn({ name: 'IdLeadUser' })
  leadUser: User;

  @OneToMany(() => SubProgram, subProgram => subProgram.program)
  subPrograms: SubProgram[];

   @OneToMany(() => ProgramsTranslation, translation => translation.program)
  translations: ProgramsTranslation[];
}