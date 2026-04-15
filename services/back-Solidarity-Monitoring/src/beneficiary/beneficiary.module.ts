import { Module } from '@nestjs/common';
import { BeneficiaryController } from './beneficiary.controller';
import { BeneficiaryService } from './beneficiary.service';

@Module({
  providers: [BeneficiaryService,
  ],
  controllers: [BeneficiaryController]
})
export class BeneficiaryModule {}
