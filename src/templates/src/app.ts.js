export const appTemplate = `import express from 'express'
import cors from 'cors'
import loadRoutes from './loadRoutes'

// 重写console的方法
import './console'
// 加载环境变量
import './loadEnv'

const app = express()

console.cliLog('监听端口，开启服务')
app.listen(process.env.PORT, () => {
    console.cliSuccess(\`服务已运行在 \${ process.env.PORT } 端口\`)
})

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

// 使用日志中间件
app.use(require('@/middlewares/requestLogger'))
// 使用json返回值中间件
app.use(require('@/middlewares/httpResponse'))
app.use(require('@/middlewares/requestParamsValidator'))

console.cliLog('自动注册路由')
loadRoutes(app)

console.cliLog('启动定时任务')
require('@/cron')`