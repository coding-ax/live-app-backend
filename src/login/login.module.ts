import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';


@Module({
  imports: [RedisCacheModule],
  controllers: [LoginController],
  providers: [LoginService]
})
export class LoginModule { }
