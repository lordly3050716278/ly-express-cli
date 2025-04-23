import Redis from 'ioredis'

export const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    password: '',
    db: 0,
})

/**
 * 设置值（可选设置过期时间，单位：秒）
 */
export async function set(key: string, value: string, expireInSeconds?: number) {
    if (expireInSeconds) {
        await redis.setex(key, expireInSeconds, value)
        return
    }
    await redis.set(key, value)
}

/**
 * 获取值
 */
export async function get(key: string): Promise<string | null> {
    return redis.get(key)
}

/**
 * 删除键
 */
export async function del(key: string) {
    await redis.del(key)
}