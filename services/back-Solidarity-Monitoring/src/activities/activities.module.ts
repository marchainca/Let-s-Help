import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { DataBaseService } from './data-base.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Program } from './entities/program.entity';
import { SubProgram } from './entities/sub-program.entity';
import { Task } from './entities/task.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Program, SubProgram, Task, User]),
  ],
  providers: [ActivitiesService, DataBaseService],
  controllers: [ActivitiesController]
})
export class ActivitiesModule {}
