import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { DataBaseService } from './data-base.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Program } from './entities/program.entity';
import { SubProgram } from './entities/sub-program.entity';
import { User } from 'src/users/entities/user.entity';
import { ActivityTracking } from './entities/activity-tracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Program, SubProgram,
      User, ActivityTracking]),
  ],
  providers: [ActivitiesService, DataBaseService],
  controllers: [ActivitiesController],
  //exports: [Task],
})
export class ActivitiesModule {}
