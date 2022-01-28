import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager'

import { generateOpenId, getPrefixKey } from 'src/common/utils';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';


@Injectable()
export class LoginService {
    // 注入缓存
    constructor(private readonly redisCacheService: RedisCacheService,) {

    }
    /**
     * 注册用户： 入参为email
     * 1. 以 email 和 unix 时间戳生成open_id 
     * 2. redis 生成以 open_id 为 key 的 hash
     * 3. hash 提供一个 register_verify 字段
     * 4. 返回要验证的 register_verify 作为链接，再次访问该链接完成注册
     * @param email 
     */
    async registerUser(email: string): Promise<void> {
        const openId = generateOpenId(email);
        const registerRedisKey = getPrefixKey(openId);
        const isInRedisCache = await this.redisCacheService.get(registerRedisKey);
        console.log(isInRedisCache);
        if (!isInRedisCache) {
            const result = await this.redisCacheService.set(registerRedisKey, '2333')
        }
        console.log(registerRedisKey)
    }
}
