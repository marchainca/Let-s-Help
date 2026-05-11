import { Module } from '@nestjs/common';
import { RecognitionController } from './recognition.controller';
import { RecognitionService } from './recognition.service';

@Module({
  providers: [RecognitionService,
  ],
  controllers: [RecognitionController]
})
export class RecognitionModule {}
