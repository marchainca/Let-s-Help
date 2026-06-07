import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FirestoreSchedulerService } from './scheduler.service';


@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [FirestoreSchedulerService],
})
export class SchedulerModule {}
