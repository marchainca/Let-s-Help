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
import { ProgramsTranslation } from 'src/common/translation/entities/programs-translation.entity';
import { SubProgramsTranslation } from 'src/common/translation/entities/subprograms-translation.entity';
import { ActivitiesTranslation } from 'src/common/translation/entities/activities-translation.entity';
import { TranslationService } from 'src/common/translation/translation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Program, SubProgram,
      User, ActivityTracking, ProgramsTranslation, SubProgramsTranslation, ActivitiesTranslation]),
  ],
  providers: [ActivitiesService, DataBaseService, TranslationService],
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}
