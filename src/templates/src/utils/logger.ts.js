export const loggerTemplate = `import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'

// 日志目录和文件路径
const logDir = path.join(process.cwd(), 'logs', process.env.NODE_ENV ?? 'development')
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
}

const logFilePath = path.join(logDir, \`\${ dayjs().format('YYYY-MM-DD')}.log\`)

// 日志格式化函数
const formatLog = (level: string, message: string) => {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return \`\${ timestamp } [\${ level }]: \${ message }\`
}

// 日志类
class Logger {
    private level: string

    constructor(level: string = 'log') {
        this.level = level
    }

    private writeLog(level: string, message: string) {
        const logMessage = formatLog(level, message)

        // 写入日志文件
        fs.appendFileSync(logFilePath, logMessage + '\\n')

        switch (level) {
            case 'log':
                console.cliLog(message) // 使用带颜色的日志
                break
            case 'warn':
                console.cliWarn(message) // 使用带颜色的日志
                break
            case 'error':
                console.cliError(message) // 使用带颜色的日志
                break
            case 'success':
                console.cliSuccess(message) // 使用带颜色的日志
                break
            default:
                console.cliLog(message) // 默认的 log 方法
                break
        }
    }

    log(message: string) {
        this.writeLog('log', message)
    }

    warn(message: string) {
        this.writeLog('warn', message)
    }

    error(message: string) {
        this.writeLog('error', message)
    }

    success(message: string) {
        this.writeLog('success', message)
    }
}

// 创建并导出 logger 实例
const logger = new Logger()

export default logger`