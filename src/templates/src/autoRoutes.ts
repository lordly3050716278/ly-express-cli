import type { Application } from 'express'
import path from 'path'
import fs from 'fs'

// 路由目录
const ROUTES_DIR = path.join(__dirname, 'routes')

// 自动注册路由
function autoRoute(routesDir: string, app: Application) {
    // 判断是否存在目录
    if (!fs.existsSync(routesDir)) {
        console.cliError(`${routesDir} 目录不存在`)
        process.exit(1)
    }

    // 读取所有的内容
    const fileOrDirs = fs.readdirSync(routesDir)
    // 遍历内容
    fileOrDirs.forEach(fileOrDir => {
        // 内容的完整路径
        const fullPath = path.join(routesDir, fileOrDir)
        // 获取内容状态
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            // 若是子目录，递归加载
            autoRoute(fullPath, app)
            return
        }

        if (!stat.isFile()) return
        const suffix = fileOrDir.substring(fileOrDir.lastIndexOf('.'))
        if (!['.ts', '.js'].includes(suffix)) return

        const { default: route } = require(fullPath)
        const contextPath = process.env.CONTEXT_PATH + fullPath.replace(ROUTES_DIR, '')
            .replace('.ts', '')
            .replace('.js', '')
            .replaceAll('\\', '/')
        app.use(`${contextPath}`, route)
        console.cliSuccess(`${contextPath} 路由注册成功`)
    })
}

module.exports = (app: Application) => autoRoute(ROUTES_DIR, app)