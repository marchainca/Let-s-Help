import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { ProgramsTranslation } from './entities/programs-translation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubProgramsTranslation } from './entities/subprograms-translation.entity';
import { ActivitiesTranslation } from './entities/activities-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProgramsTranslation,
      SubProgramsTranslation,
      ActivitiesTranslation
    ]),
  ],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
