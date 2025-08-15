import fs from 'fs'
import http from 'http'
import https from 'https'
import express from 'express'
import cors from 'cors'

// 重写console的方法
import './console'
// 加载环境变量
import './env'

// 全局错误捕获
process.on('uncaughtException', (err) => {
    console.cliError('未捕获的异常（uncaughtException）:', err)
})

process.on('unhandledRejection', (reason, promise) => {
    console.cliError('未处理的Promise拒绝（unhandledRejection）:', reason)
})

const app = express()

console.cliLog('跨域处理')
app.use(cors())

console.cliLog('解析JSON的请求体')
app.use(express.json())

console.cliLog('解析URL编码的数据')
app.use(express.urlencoded({ extended: true }))

console.cliLog('静态资源服务')
app.use(process.env.ASSETS_CONTEXT_PATH, require('@/middlewares/refer'), express.static(process.env.ASSETS_PATH))

console.cliLog('临时文件服务')
app.use(process.env.TEMP_CONTEXT_PATH, express.static(process.env.TEMP_PATH))

// 使用中间件
app.use(require('@/middlewares/httpResponse'))
app.use(require('@/middlewares/paramsValidator'))

console.cliLog('自动注册路由')
require('./autoRoutes')(app)

console.cliLog('启动定时任务')
require('@/cron')


// --------------------- 启动 HTTP/HTTPS ---------------------
const BASE = process.env.BASE
const PORT = process.env.PORT
const isDev = process.env.NODE_ENV === 'development'
let server

if (isDev) {
    // 开发环境直接 HTTP
    server = http.createServer(app)
    server.listen(PORT, () => {
        console.cliSuccess(`开发环境服务已运行在 ${BASE}:${PORT}`)
    })
} else {
    // 生产环境使用 HTTPS
    const options = {
        key: fs.readFileSync('privkey.pem 路径'),
        cert: fs.readFileSync('fullchain.pem 路径'),
    }
    server = https.createServer(options, app)
    server.listen(PORT, () => {
        console.cliSuccess(`生产环境服务已运行在 ${BASE}:${PORT}`)
    })
}
