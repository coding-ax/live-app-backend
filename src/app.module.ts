import { Module, NestModule, MiddlewareConsumer, CacheModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { LoginController } from './login/login.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionMiddleware } from 'src/middleware/session.middleware';

const TypeOrmInstanceModule = TypeOrmModule.forRoot();
@Module({
  imports: [LoginModule, TypeOrmInstanceModule, CacheModule.register({
    isGlobal: true,
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .forRoutes(LoginController)
  }
}
