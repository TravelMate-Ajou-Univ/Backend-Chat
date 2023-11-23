import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import basicAuth from 'express-basic-auth';
import { UnhandledExceptionFilter } from './common/filiters/unhandled-exception.filter';
import { HttpExceptionFilter } from './common/filiters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ValidationHttpError } from './common/errors/validation-http-error';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import express from 'express';
import { RedisIoAdapter } from './chat/adapters/socket-io.adapters';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.use(express.static(join(__dirname, 'public')));

  app.useWebSocketAdapter(new RedisIoAdapter(app));

  app.setBaseViewsDir(join(__dirname, 'views'));
  app.setViewEngine('ejs');

  const user = app.get<ConfigService>(ConfigService).get('SWAGGER_USER');
  const pw = app.get<ConfigService>(ConfigService).get('SWAGGER_PASSWORD');

  app.use(
    ['/api/docs'],
    basicAuth({
      challenge: true,
      users: {
        [user]: pw,
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        return new ValidationHttpError(errors);
      },
    }),
  );

  app.useGlobalFilters(
    new UnhandledExceptionFilter(),
    new HttpExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('TravelMate Swagger')
    .setDescription('캡스톤 디자인 TravelMate BE API 스웨거입니다.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('swagger')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  const port = app.get<ConfigService>(ConfigService).get('SERVER_PORT');

  await app.listen(port ?? 80);
}
bootstrap();
