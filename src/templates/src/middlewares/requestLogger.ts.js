export const requestLoggerTemplate = `import type Middleware from '@/types/middleware'
import logger from '@/utils/logger'

module.exports = ((req, resp, next) => {
    const start = Date.now()

    // 请求开始时，记录日志
    logger.log(\`Request started | Method: \${ req.method } | URL: \${ req.originalUrl } | Body: \${ JSON.stringify(req.body) } \`)

    // 响应结束后，记录日志
    resp.on('finish', () => {
        const responseTime = Date.now() - start

        let logLevel: 'log' | 'warn' | 'error' | 'success'

        // 使用 switch 来判断不同的状态码并选择日志级别
        switch (true) {
            case (resp.statusCode >= 200 && resp.statusCode < 300):
                logLevel = 'success' // 成功请求
                break
            case (resp.statusCode >= 400 && resp.statusCode < 500):
                logLevel = 'warn' // 客户端错误
                break
            case (resp.statusCode >= 500 && resp.statusCode < 600):
                logLevel = 'error' // 服务器错误
                break
            default:
                logLevel = 'log' // 默认情况
                break
        }

        // 记录响应日志
        logger[logLevel](\`Request completed | Method: \${ req.method } | URL: \${ req.originalUrl } | Status: \${ resp.statusCode } | ResponseTime: \${ responseTime } ms | Body: \${ JSON.stringify(resp.body) }\`)
    })

    next()
}) as Middleware`