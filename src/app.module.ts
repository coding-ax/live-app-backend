import { UploadController } from './upload/upload.controller';
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  CacheModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { LoginController } from './login/login.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionMiddleware } from 'src/middleware/session.middleware';
import { UploadModule } from './upload/upload.module';
import { LiveModule } from './live/live.module';

const TypeOrmInstanceModule = TypeOrmModule.forRoot();
@Module({
  imports: [
    LoginModule,
    TypeOrmInstanceModule,
    CacheModule.register({
      isGlobal: true,
    }),
    UploadModule,
    LiveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .forRoutes(LoginController, UploadController);
  }
}
