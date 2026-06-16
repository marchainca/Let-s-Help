import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DataBaseServiceAttendance } from './data-base-attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiary } from 'src/recognition/entities/beneficiary.entity';
import { Attendance } from './entities/attendance.entity';
import { Absence } from 'src/users/entities/absence.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { AbsencesTranslation } from 'src/common/translation/entities/absences-translation.entity';
import { TranslationService } from 'src/common/translation/translation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Beneficiary,
      Attendance,
      Absence,
      Activity,
      AbsencesTranslation
    ])
  ],
  providers: [AttendanceService, DataBaseServiceAttendance, TranslationService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
