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
import { ReportsModule } from './reports/reports.module';
import { ActivitiesModule } from './activities/activities.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { RecognitionModule } from './recognition/recognition.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const schemaFromUrl = databaseUrl
          ? new URL(databaseUrl).searchParams.get('schema')
          : null;

        return {
          type: 'postgres',
          url: databaseUrl,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', '123'),
          database: configService.get<string>('DB_NAME', 'lets_help'),
          schema: configService.get<string>('DB_SCHEMA', schemaFromUrl ?? 'public'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'false',
          ssl: configService.get<string>('DB_SSL', 'false') === 'true',
        };
      },
    }),
    FirebaseModule,
    AuthModule,
    UsersModule,
    AttendanceModule,
    SchedulerModule,
    RecognitionModule,
    ReportsModule,
    ActivitiesModule,
    DashboardModule,
  ],
  controllers: [AppController, ],
  providers: [AppService, FirestoreConnectionService],
})
export class AppModule {}
