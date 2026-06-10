import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import logger from 'morgan';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';
import { LanguageInterceptor } from './common/interceptors/language.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors: true});
  app.use(
    '/uploads',
    express.static(join(__dirname, '..', 'uploads')),
  );
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true }),
  );
  app.useGlobalInterceptors(new LanguageInterceptor());
  app.use(logger('dev'))
  await app.listen(4000);
}
bootstrap();
