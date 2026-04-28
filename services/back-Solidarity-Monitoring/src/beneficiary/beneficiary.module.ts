import { Module } from '@nestjs/common';
import { BeneficiaryController } from './beneficiary.controller';
import { BeneficiaryService } from './beneficiary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiary } from './entities/beneficiary.entity';
import { City } from './entities/city.entity';
import { State } from './entities/state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Beneficiary,
      City,
      State
    ])
  ],
  providers: [BeneficiaryService,
  ],
  controllers: [BeneficiaryController]
})
export class BeneficiaryModule {}
