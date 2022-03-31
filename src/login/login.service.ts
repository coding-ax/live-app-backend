import { Injectable } from '@nestjs/common';

import {
  decodeOpenId,
  generateOpenId,
  getPrefixKey,
  sendMail,
} from 'src/common/utils';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { UserAuth } from './database/user-auth.entity';
import { UserDetail } from './database/user-detail.entity';
import { UserLoginHistory } from './database/user-history.entity';
import dayjs from 'dayjs';
import { UpdateProfileRequest } from './dto/login.dto';

const VERIFY_MAIL_SUBJECT = '【5分钟内有效】live-app注册验证';
const baseURL = 'http://localhost:3000/login/register/';

const VERIFY_MAIL_TEMPLATE = (link: string): string => `
<h2 style="text-align: center;">欢迎注册live-app</h2>
<h3  style="text-align: center;"><a href="${link}">点我验证</a></h3>
`;

/**
 * isInRegisterProcess: 之前注册过还没有验证
 * isRegistered: 已经注册过
 * verifyUrl: 验证链接
 */
type RegisterUserResponse = {
  verifyUrl: string;
  isInRegisterProcess: boolean;
  isRegistered: boolean;
};

/**
 *  email: 如果准确，返回待验证的 email,
 *  isVerified: 是否验证通过
 */
type VerifyUserResponse = {
  email: string;
  isVerified: boolean;
  temp_passwd?: string;
  isRegistered?: boolean;
};

type RegisterUserSession = {
  register_verify?: string;
  temp_passwd?: string;
};

type GetRegister = {
  data: RegisterUserSession;
  openId: string;
  registerRedisKey: string;
};

type LoginUserSession = {
  detail?: UserDetail;
  email: string;
  openId: string;
};

type UserAuthParamKeys = 'open_id' | 'id' | 'email';
type UserAuthKey = {
  [P in UserAuthParamKeys]?: string;
};

@Injectable()
export class LoginService {
  // 注入缓存和typeorm数据库
  constructor(
    private readonly redisCacheService: RedisCacheService,
    @InjectRepository(UserAuth)
    private userAuthRepository: Repository<UserAuth>,
    @InjectRepository(UserDetail)
    private userDetailRepository: Repository<UserDetail>,
    @InjectRepository(UserLoginHistory)
    private userLoginHistoryRepository: Repository<UserLoginHistory>,
    private connection: Connection,
  ) {}

  async findOne(option: UserAuthKey): Promise<UserAuth> {
    return await this.userAuthRepository.findOne(
      option as unknown as Partial<UserAuth>,
    );
  }

  async getUserAuth({ email, open_id }: UserAuthKey) {
    const options = open_id ? { open_id } : { email };
    const userAuth = await this.findOne(options);
    return userAuth;
  }

  async editProfile(
    openId: string,
    userDetail: UpdateProfileRequest,
  ): Promise<any> {
    try {
      const detail = await this.userDetailRepository.findOne({
        open_id: openId,
      });
      detail.nick_name = userDetail.nickName;
      detail.avatar_url = userDetail.avatarUrl;
      detail.signature = userDetail.signature;
      await this.userDetailRepository.save(detail);
      // 删除 redis 中的对应缓存
      return detail;
    } catch (error) {
      return {};
    }
  }

  async authUserLogin(userAuth: UserAuth): Promise<LoginUserSession> {
    const { open_id, email } = userAuth;
    const redisOpenIdKey = getPrefixKey(open_id);
    // 保存这次登录记录，埋点记录不需要异步等待
    this.userLoginHistoryRepository.insert({
      login_time: dayjs().toString(),
      open_id: open_id,
    });
    const queryRedis = await this.redisCacheService.get(redisOpenIdKey);
    if (queryRedis) {
      return queryRedis as LoginUserSession;
    }
    // redis 中如果不存在对应信息，则去查询 Mysql 并缓存到 Redis
    const userDetail = await this.userDetailRepository.findOne({ open_id });
    const redisCache: LoginUserSession = {
      detail: userDetail,
      email,
      openId: open_id,
    };
    // 将用户信息保存到 redis, session 有效时长 10 分钟, 此处不需要用户端等待
    this.redisCacheService.set(redisOpenIdKey, redisCache, { ttl: 10 * 60 });
    return redisCache;
  }

  async getRedisRegisterKeyByEmail(email): Promise<GetRegister> {
    // 这里的 openId 都是临时的 openId
    const openId = generateOpenId(email, false);
    const registerRedisKey = getPrefixKey(openId);
    const result: RegisterUserSession = await this.redisCacheService.get(
      registerRedisKey,
    );
    return {
      data: result,
      openId,
      registerRedisKey,
    };
  }

  /**
   * 注册用户： 入参为email
   * 1. 以 email 生成 open_id ,查看是否在数据库中已经存在
   * 2. redis 生成以 open_id 为 key 的 hash
   * 3. hash 提供一个 register_verify 字段 临时存储一个 temp_passwd 保存传入的密码
   * 4. 返回要验证的 register_verify 作为链接，再次访问该链接完成注册
   * @param email
   */
  async registerUser(
    email: string,
    password: string,
  ): Promise<RegisterUserResponse> {
    // 检测是否已经注册 判断 MySQL 中是否已经存在该条记录
    const isRegistered = await this.findOne({ email });
    if (isRegistered) {
      return {
        verifyUrl: '',
        isInRegisterProcess: false,
        isRegistered: true,
      };
    }
    // 未被注册进入下一个流程: 检查 redis
    // 查看是否已经在 Redis 里，用来判断是否已经进入验证环节
    const { data: isInRedisCache, registerRedisKey } =
      await this.getRedisRegisterKeyByEmail(email);
    // 如果 redis 中有这条数据，说明已经进入验证环节
    if (isInRedisCache) {
      return {
        verifyUrl: isInRedisCache.register_verify,
        isInRegisterProcess: true,
        isRegistered: false,
      };
    }
    // 生成对应链接：
    const verifyResult = {
      register_verify: generateOpenId(email),
      temp_passwd: password,
    };
    const config = {
      // 5分钟内有校
      ttl: 5 * 60,
    };

    // 设置 redis 中的 key
    await this.redisCacheService.set(registerRedisKey, verifyResult, config);

    // 发送邮件
    const link = `${baseURL}${verifyResult.register_verify}?email=${email}`;
    sendMail(email, VERIFY_MAIL_SUBJECT, VERIFY_MAIL_TEMPLATE(link));

    return {
      verifyUrl: verifyResult.register_verify,
      isInRegisterProcess: false,
      isRegistered: false,
    };
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
    const isRegistered = await this.findOne({ email });
    if (isRegistered) {
      return {
        isVerified: false,
        email: email,
        isRegistered: true,
      };
    }

    const { data: isInRedisCache } = await this.getRedisRegisterKeyByEmail(
      email,
    );
    if (!isInRedisCache) {
      return {
        isVerified: false,
        email: '',
      };
    }
    const { register_verify, temp_passwd } = isInRedisCache;

    if (id === register_verify) {
      return {
        email,
        isVerified: true,
        temp_passwd,
      };
    }

    return {
      email,
      isVerified: false,
    };
  }

  /**
   * 新增用户到 user-auth 表
   * @param email 邮件
   * @param password 密码
   * @returns
   */
  async addUser(email, password): Promise<void> {
    const isExists = await this.findOne({ email });
    if (isExists) {
      return;
    }
    // 真正用户的注册 openId
    const realOpenId = generateOpenId(email);
    const userAuth: UserAuth = new UserAuth();
    const userDetail: UserDetail = new UserDetail();
    Object.assign(userAuth, {
      email,
      password,
      open_id: realOpenId,
      id: 0,
    });
    Object.assign(userDetail, {
      open_id: realOpenId,
      nick_name: '',
      signature: '',
      avatar_url: '',
    });
    await this.userAuthRepository.insert(userAuth);
    await this.userDetailRepository.insert(userDetail);
  }
}
