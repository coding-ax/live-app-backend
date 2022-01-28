import { Injectable } from '@nestjs/common';

import { generateOpenId, getPrefixKey } from 'src/common/utils';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';


import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAuth } from './database/user-auth.entity';

/**
 * isInRegisterProcess: 之前注册过还没有验证
 * isRegistered: 已经注册过
 * verifyUrl: 验证链接
 */
type RegisterUserResponse = {
    verifyUrl: string;
    isInRegisterProcess: boolean;
    isRegistered: boolean;
}

type UserSession = {
    register_verify?: string
}

@Injectable()
export class LoginService {
    // 注入缓存和typeorm数据库
    constructor(private readonly redisCacheService: RedisCacheService,
        @InjectRepository(UserAuth)
        private userAuthRepository: Repository<UserAuth>,) { }

    /**
     * 注册用户： 入参为email
     * 1. 以 email 生成 open_id ,查看是否在数据库中已经存在
     * 2. redis 生成以 open_id 为 key 的 hash
     * 3. hash 提供一个 register_verify 字段
     * 4. 返回要验证的 register_verify 作为链接，再次访问该链接完成注册
     * @param email 
     */
    async registerUser(email: string): Promise<RegisterUserResponse> {
        // 检测是否已经注册 判断 MySQL 中是否已经存在该条记录
        const isRegistered = await this.userAuthRepository.findOne({
            email
        })
        if (isRegistered) {
            return {
                verifyUrl: '',
                isInRegisterProcess: false,
                isRegistered: true
            }
        }
        // 未被注册进入下一个流程: 检查 redis
        const openId = generateOpenId(email, false);
        const registerRedisKey = getPrefixKey(openId);
        // 查看是否已经在 Redis 里，用来判断是否已经进入验证环节
        const isInRedisCache: UserSession = await this.redisCacheService.get(registerRedisKey);
        // 如果 redis 中有这条数据，说明已经进入验证环节
        if (isInRedisCache) {
            return {
                verifyUrl: isInRedisCache.register_verify,
                isInRegisterProcess: true,
                isRegistered: false
            }
        }
        // 生成对应链接：
        const verifyResult = {
            register_verify: generateOpenId(email),
        };
        const config = {
            // 5分钟内有校
            ttl: 5 * 60
        };
        await this.redisCacheService.set(registerRedisKey, verifyResult, config)

        return {
            verifyUrl: verifyResult.register_verify,
            isInRegisterProcess: false,
            isRegistered: false
        }

    }
}
