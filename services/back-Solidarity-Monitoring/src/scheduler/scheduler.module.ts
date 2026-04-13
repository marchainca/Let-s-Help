import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FirestoreConnectionService } from 'src/firebase/firestore-connection.service';
import { FirestoreSchedulerService } from './scheduler.service';


@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [FirestoreSchedulerService, FirestoreConnectionService],
})
export class SchedulerModule {}
