export const loggerFile = `import pino from 'pino'
import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'

// 创建 Pino 日志实例
const createLogger = () => {
    const logDir = path.join(process.cwd(), 'logs', process.env.NODE_ENV ?? 'development')
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    const logFilePath = path.join(logDir, \`\${ dayjs().format('YYYY-MM-DD') }.log\`)

    const transport = pino.transport({
        target: 'pino-pretty',
        options: {
            destination: logFilePath, // 输出到文件
            colorize: false, // 不添加颜色（因为输出到文件）
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', // 格式化时间
            singleLine: false // 不以单行输出
        }
    })

    return pino({ level: 'info' }, transport)
}

export default createLogger()`
