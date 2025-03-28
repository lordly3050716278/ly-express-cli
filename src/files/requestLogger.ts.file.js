export const requestLoggerFile = `import logger from '@/utils/logger'
import pinoHttp from 'pino-http'

// 日志中间件
module.exports = () => pinoHttp({
    logger, // 使用 Pino 实例
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) {
            return 'error'
        }
        if (res.statusCode >= 400) {
            return 'warn'
        }
        return 'info'
    }
})`
