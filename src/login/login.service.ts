import { Injectable } from '@nestjs/common';

import { decodeOpenId, generateOpenId, getPrefixKey, sendMail } from 'src/common/utils';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';


import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { UserAuth } from './database/user-auth.entity';

const VERIFY_MAIL_SUBJECT = "【5分钟内有效】live-app注册验证";
const baseURL = 'http://localhost:3000/login/register/'

const VERIFY_MAIL_TEMPLATE = (link: string): string => `
<h2 style="text-align: center;">欢迎注册live-app</h2>
<h3  style="text-align: center;"><a href="${link}">点我验证</a></h3>
`

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

/**
 *  email: 如果准确，返回待验证的 email,
 *  isVerified: 是否验证通过
 */
type VerifyUserResponse = {
    email: string,
    isVerified: boolean,
    temp_passwd?: string,
    isRegistered?: boolean
}

type UserSession = {
    register_verify?: string,
    temp_passwd?: string
}

type GetRegister = {
    data: UserSession,
    openId: string,
    registerRedisKey: string
}

@Injectable()
export class LoginService {
    // 注入缓存和typeorm数据库
    constructor(private readonly redisCacheService: RedisCacheService,
        @InjectRepository(UserAuth)
        private userAuthRepository: Repository<UserAuth>,
        private connection: Connection
    ) { }

    async findOne(email): Promise<UserAuth> {
        return await this.userAuthRepository.findOne({ email })
    }

    async getRedisRegisterKeyByEmail(email): Promise<GetRegister> {
        // 这里的 openId 都是临时的 openId
        const openId = generateOpenId(email, false);
        const registerRedisKey = getPrefixKey(openId);
        const result: UserSession = await this.redisCacheService.get(registerRedisKey);
        return {
            data: result,
            openId,
            registerRedisKey
        }
    }

    /**
     * 注册用户： 入参为email
     * 1. 以 email 生成 open_id ,查看是否在数据库中已经存在
     * 2. redis 生成以 open_id 为 key 的 hash
     * 3. hash 提供一个 register_verify 字段 临时存储一个 temp_passwd 保存传入的密码
     * 4. 返回要验证的 register_verify 作为链接，再次访问该链接完成注册
     * @param email 
     */
    async registerUser(email: string, password: string): Promise<RegisterUserResponse> {
        // 检测是否已经注册 判断 MySQL 中是否已经存在该条记录
        const isRegistered = await this.findOne(email)
        if (isRegistered) {
            return {
                verifyUrl: '',
                isInRegisterProcess: false,
                isRegistered: true
            }
        }
        // 未被注册进入下一个流程: 检查 redis
        // 查看是否已经在 Redis 里，用来判断是否已经进入验证环节
        const { data: isInRedisCache, registerRedisKey } = await this.getRedisRegisterKeyByEmail(email);
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
            temp_passwd: password
        };
        const config = {
            // 5分钟内有校
            ttl: 5 * 60
        };

        // 设置 redis 中的 key
        await this.redisCacheService.set(registerRedisKey, verifyResult, config)

        // 发送邮件
        const link = `${baseURL}${verifyResult.register_verify}?email=${email}`;
        sendMail(email, VERIFY_MAIL_SUBJECT, VERIFY_MAIL_TEMPLATE(link))

        return {
            verifyUrl: verifyResult.register_verify,
            isInRegisterProcess: false,
            isRegistered: false
        }
    }

    /**
     * 
     * @param id 传入要验证的id
     * @returns { email: string, isVerified: boolean } 如果准确，返回待验证的 email
     */
    async verifyRegister(id: string): Promise<VerifyUserResponse> {
        // 获取到 id 还原 id 后, 然后查看 redis 中是否存在该 key，用于判断是否过期
        const { email } = decodeOpenId(id);
        // 验证是否已经注册
        const isRegistered = await this.findOne(email);
        if (isRegistered) {
            return {
                isVerified: false,
                email: email,
                isRegistered: true
            }
        }

        const { data: isInRedisCache } = await this.getRedisRegisterKeyByEmail(email);
        if (!isInRedisCache) {
            return {
                isVerified: false,
                email: ''
            }
        }
        const { register_verify, temp_passwd } = isInRedisCache;

        if (id === register_verify) {
            return {
                email,
                isVerified: true,
                temp_passwd
            }
        }

        return {
            email,
            isVerified: false
        }
    }

    async addUser(email, password): Promise<void> {
        const isExists = await this.findOne(email);
        if (isExists) {
            return
        }
        // 真正用户的注册 openId
        const realOpenId = generateOpenId(email);
        const userAuth: UserAuth = new UserAuth();
        Object.assign(userAuth, {
            email,
            password,
            open_id: realOpenId,
            id: 0
        })


        // 插入数据库, 开启事务
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.save(userAuth);
            await queryRunner.commitTransaction();
        } catch (err) {
            console.error(err);
            //如果遇到错误，可以回滚事务
            await queryRunner.rollbackTransaction();
        } finally {
            //你需要手动实例化并部署一个queryRunner
            await queryRunner.release();
        }
    }
}
