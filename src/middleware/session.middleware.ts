import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { UserDetail } from '../login/database/user-detail.entity';


@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private userDetailRepository = getRepository(UserDetail);
  constructor() { }
  async use(req: Request, res: Response, next: NextFunction) {
    console.log('获取session');
    const { open_id: openId = '' } = req.headers;
    if (openId) {
      const data = await this.userDetailRepository.findOne({
        open_id: `${openId}`
      })
      // 把 user-info 放到 headers 里，传递给后续使用
      req.headers['user-info'] = JSON.stringify(data);
    }

    // 为 req 添加 session
    next();
  }
}
