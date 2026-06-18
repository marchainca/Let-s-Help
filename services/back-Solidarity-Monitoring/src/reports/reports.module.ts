import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DataBaseReportsService } from './data-base-reports.service';
import { DataBaseRecognitionService } from 'src/recognition/data-base-recognition.service';
import { UsersDataBaseService } from 'src/users/users-data-base.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/users/entities/report.entity';
import { Beneficiary } from 'src/recognition/entities/beneficiary.entity';
import { DocumentType } from 'src/recognition/entities/document-type.entity';
import { Neighborhood } from 'src/recognition/entities/neighborhood.entity';
import { Address } from 'src/recognition/entities/address.entity';
import { BiometricData } from 'src/recognition/entities/biometric-data.entity';
import { City } from 'src/recognition/entities/city.entity';
import { User } from 'src/users/entities/user.entity';
import { ReportsTranslation } from 'src/common/translation/entities/reports-translation.entity';
import { TranslationService } from 'src/common/translation/translation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          Report, Beneficiary,
          DocumentType, Neighborhood,
          Address, BiometricData,
          City, User, ReportsTranslation
        ]),
      ],
    providers: [
      ReportsService, DataBaseReportsService,
      DataBaseRecognitionService, UsersDataBaseService, TranslationService
      ],
      controllers: [ReportsController]
})
export class ReportsModule {}
