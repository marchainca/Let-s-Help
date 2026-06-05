import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DataBaseDashboardService } from './data-base-dashboard.service';
import { ActivityTracking } from 'src/activities/entities/activity-tracking.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityTracking, Attendance, User]),
  ],
  providers: [DashboardService, DataBaseDashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
