import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AttendanceModule } from './attendance/attendance.module';
import { FirestoreConnectionService } from './firebase/firestore-connection.service';
import { SchedulerModule } from './scheduler/scheduler.module';
import { RecognitionModule } from './recognition/recognition.module';
import { ReportsModule } from './reports/reports.module';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    FirebaseModule,
    AuthModule,
    UsersModule,
    AttendanceModule,
    SchedulerModule,
    RecognitionModule,
    ReportsModule,
    ActivitiesModule
  ],
  controllers: [AppController, ],
  providers: [AppService, FirestoreConnectionService],
})
export class AppModule {}
