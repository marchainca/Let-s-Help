import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../common/strategies/jwt-strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AttendanceModule } from 'src/attendance/attendance.module';

@Module({
  imports: [
    ConfigModule,
    AttendanceModule,
    UsersModule, 
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule,], // Importar el módulo de configuración
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'), 
        //signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, FirebaseService, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
