import type Middleware from '@/types/middleware'

module.exports = ((req, resp, next) => {
    req.paramsValidator = function <T extends string>(...keys: T[]) {
        const params = this.method === 'GET' ? this.query : this.body

        const valid = {} as Record<T, any>
        const others: Omit<Record<string, any>, T> = {} as any

        for (const key of keys) {
            const value = params[key]
            if (value === undefined) throw new Error(`缺少参数 ${key}`)
            valid[key] = value
        }

        for (const key in params) {
            if (keys.includes(key as T)) continue
            (others as any)[key] = params[key]
        }

        return { valid, others }
    }

    next()
}) as Middleware