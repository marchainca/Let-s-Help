import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DataBaseServiceAttendance } from './data-base-attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiary } from 'src/recognition/entities/beneficiary.entity';
import { Attendance } from './entities/attendance.entity';
import { Task } from 'src/activities/entities/task.entity';
import { Absence } from 'src/users/entities/absence.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Beneficiary,
      Attendance,
      Task,
      Absence
    ])
  ],
  providers: [AttendanceService, DataBaseServiceAttendance],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
