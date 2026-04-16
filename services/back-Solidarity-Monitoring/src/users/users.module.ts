import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { BeneficiaryService } from 'src/beneficiary/beneficiary.service';

@Module({
  providers: [UsersService,
    FirebaseService
  ],
  controllers: [UsersController]
})
export class UsersModule {}
