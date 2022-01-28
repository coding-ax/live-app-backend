import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';

@Module({
  imports: [LoginModule, RedisCacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
