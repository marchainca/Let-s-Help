import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DataBaseServiceAttendance } from './data-base-attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiary } from 'src/beneficiary/entities/beneficiary.entity';
import { Attendance } from './entities/attendance.entity';
import { Activity } from 'src/activities/entities/activity.entity';
import { Absence } from 'src/users/entities/absence.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Beneficiary,
      Attendance,
      Activity,
      Absence
    ])
  ],
  providers: [AttendanceService, DataBaseServiceAttendance],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
