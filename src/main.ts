import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { initEnv } from './env';

async function bootstrap() {
  initEnv();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser('live-app'));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
