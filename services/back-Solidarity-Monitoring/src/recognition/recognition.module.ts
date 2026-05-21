import { Module } from '@nestjs/common';
import { RecognitionController } from './recognition.controller';
import { RecognitionService } from './recognition.service';
import { DataBaseRecognitionService } from './data-base-recognition.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiary } from './entities/beneficiary.entity';
import { City } from './entities/city.entity';
import { Neighborhood } from './entities/neighborhood.entity';
import { Address } from './entities/address.entity';
import { BiometricData } from './entities/biometric-data.entity';
import { DocumentType } from './entities/document-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Beneficiary,
      City,
      DocumentType,
      Neighborhood,
      Address,
      BiometricData
    ]),
  ],
  providers: [RecognitionService, DataBaseRecognitionService,
  ],
  controllers: [RecognitionController],
  exports: [DataBaseRecognitionService]
})
export class RecognitionModule {}
