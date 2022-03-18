import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import Redis from 'ioredis';

import { UserDetail } from '../login/database/user-detail.entity';
import { getPrefixKey } from 'src/common';

const redisClient = new Redis({
  host: 'localhost',
  port: 6379
});

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private userDetailRepository = getRepository(UserDetail);
  constructor() { }
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { open_id: openId = '' } = req.headers;
      const redisKey = getPrefixKey(`${openId}`);
      if (openId) {
        const redisCache = await redisClient.get(redisKey);
        let data = null;
        if (redisCache) {
          data = redisCache;
        } else {
          data = await this.userDetailRepository.findOne({
            open_id: `${openId}`
          })
          data && redisClient.set(redisKey, JSON.stringify(data), 'EX', 60 * 5);
        }
        // 把 user-info 放到 headers 里，传递给后续使用
        req.headers['user-info'] = data || '';
      }

      // 为 req 添加 session
    } catch (error) {
      console.error(error);
    }
    next();
  }
}
