import { CacheModule, Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import * as redisStore from 'cache-manager-redis-store'

export const CacheInstanceModule = CacheModule.register({
  store: redisStore,
  host: 'localhost',
  port: 6379,
});

@Module({
  providers: [RedisCacheService],
  imports: [CacheInstanceModule],
  exports: [RedisCacheService]
})
export class RedisCacheModule { }
