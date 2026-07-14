import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DataBaseDashboardService } from './data-base-dashboard.service';
import { ActivityTracking } from 'src/activities/entities/activity-tracking.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { User } from 'src/users/entities/user.entity';
import { Beneficiary } from 'src/recognition/entities/beneficiary.entity';
import { Program } from 'src/activities/entities/program.entity';
import { SubProgram } from 'src/activities/entities/sub-program.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { Absence } from 'src/users/entities/absence.entity';
import { Report } from 'src/users/entities/report.entity';
import { ProgramsTranslation } from 'src/common/translation/entities/programs-translation.entity';
import { SubProgramsTranslation } from 'src/common/translation/entities/subprograms-translation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityTracking,
      Attendance,
      User,
      Beneficiary,
      Program,
      SubProgram,
      Activity,
      Absence,
      Report,
      ProgramsTranslation,
      SubProgramsTranslation,
    ]),
  ],
  providers: [DashboardService, DataBaseDashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
