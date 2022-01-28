import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAuth } from './database/user-auth.entity'


const typeOrmFeatureEntities = [UserAuth];
@Module({
  imports: [RedisCacheModule, TypeOrmModule.forFeature(typeOrmFeatureEntities)],
  controllers: [LoginController],
  providers: [LoginService]
})
export class LoginModule { }
