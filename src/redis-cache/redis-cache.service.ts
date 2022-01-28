import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache, CachingConfig } from 'cache-manager';
@Injectable()
export class RedisCacheService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) { }
    public async get(key: string) {
        return await this.cache.get(key);
    }
    /**
     * 代理cache的set方法
     * @param key string
     * @param value 要设置的值
     * @param option 通过ttl设置超时时间, 默认为300s
     * @returns 
     */
    public async set(key, value, option: CachingConfig = { ttl: 300 }) {
        return await this.cache.set(key, value, option);
    }
    public async del(key) {
        return await this.cache.del(key);
    }
    /**
     * 获取cache的实例
     * @returns cache
     */
    public getCacheInstance() {
        return this.cache;
    }
}