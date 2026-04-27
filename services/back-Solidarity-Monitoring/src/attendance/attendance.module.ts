import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DataBaseService } from './data-base.service';

@Module({
  providers: [AttendanceService, DataBaseService],
  controllers: [AttendanceController]
})
export class AttendanceModule {}
