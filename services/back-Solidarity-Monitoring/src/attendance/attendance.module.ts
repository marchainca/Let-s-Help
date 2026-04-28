import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DataBaseServiceAttendance } from './data-base-attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiary } from 'src/beneficiary/entities/beneficiary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Beneficiary,
    ])
  ],
  providers: [AttendanceService, DataBaseServiceAttendance],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
