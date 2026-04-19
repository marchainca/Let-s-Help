import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { BeneficiaryService } from 'src/beneficiary/beneficiary.service';
import { DataBaseService } from './data-base.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService,
    FirebaseService,
    DataBaseService
  ],
  controllers: [UsersController]
})
export class UsersModule {}
