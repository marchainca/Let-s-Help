import { Test, TestingModule } from '@nestjs/testing';
import { RecognitionController } from './beneficiary.controller';

describe('RecognitionController', () => {
  let controller: RecognitionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecognitionController],
    }).compile();

    controller = module.get<RecognitionController>(RecognitionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
