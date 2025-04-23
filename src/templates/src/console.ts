import clc from 'cli-color'

// 定义颜色和样式
const logLevelColors = {
    log: clc.blue,
    warn: clc.yellow,
    error: clc.red,
    success: clc.green
}

// 获取当前时间戳
const getTimestamp = () => new Date().toLocaleTimeString()

// 保存原始的 console 方法
const originalConsole = { ...console }

// 判断是否是 Error 对象
const isError = (obj: any): obj is Error => obj instanceof Error

// 统一的日志方法
const log = (level: keyof typeof logLevelColors, ...args: any[]) => {
    const color = logLevelColors[level]
    const originalMethod = level === 'success' ? originalConsole.log : originalConsole[level]
    // 处理参数中的 Error 对象
    const processedArgs = args.map(arg => {
        // 如果是 Error 对象，提取完整堆栈信息
        if (isError(arg)) return color(arg.stack || arg.message)

        // 其他类型直接应用颜色
        return color(arg)
    })
    // 打印时间戳和日志级别
    const timestampLabel = color(`${getTimestamp()} [${level.toUpperCase()}]`)
    originalMethod(timestampLabel, ...processedArgs)
}

// 重写 console 方法
console.cliLog = (...args: any[]) => log('log', ...args)
console.cliWarn = (...args: any[]) => log('warn', ...args)
console.cliError = (...args: any[]) => log('error', ...args)
console.cliSuccess = (...args: any[]) => log('success', ...args)