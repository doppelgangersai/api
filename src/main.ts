import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { TrimStringsPipe } from './modules/common/transformer/trim-strings.pipe';
import { AppModule } from './modules/main/app.module';
import { setupSwagger } from './swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<
    NestExpressApplication & INestApplication
  >(AppModule);

  setupSwagger(app);
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  app.useBodyParser('json', { limit: '50mb' });
  app.useGlobalPipes(new TrimStringsPipe(), new ValidationPipe());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useStaticAssets(join(__dirname, '..', 'uploads/avatars'), {
    prefix: '/uploads/avatars',
  });

  await app.listen(3000);
}
bootstrap();
