#!/usr/bin/env node

import { program } from 'commander'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { execSync } from 'child_process'

// 指定版本和描述信息
program
    .version('0.0.2')
    .description('用于创建 Express + TypeScript 接口项目')

// 初始化一个 Express + TypeScript 项目
program.command('init')
    .description("初始化一个 Express + TypeScript 项目")
    .action(async () => {
        // 交互式提问
        const { projectName, installDeps } = await inquirer.prompt([
            { type: 'input', name: 'projectName', message: '项目名称：' },
            { type: 'confirm', name: 'installDeps', message: '是否安装依赖？', default: true }
        ])

        if (!projectName) {
            console.log(chalk.red('❌ 项目名称不能为空！'))
            return
        }

        // 项目路径
        const projectPath = path.join(process.cwd(), projectName)

        // 目录存在
        if (fs.existsSync(projectPath)) {
            const { replaceDir } = await inquirer.prompt([
                { type: "confirm", name: "replaceDir", message: "目录已存在，是否覆盖？", default: true }
            ])
            if (!replaceDir) return
            fs.rmSync(projectPath, { recursive: true })
        }

        // 创建项目目录
        console.log(chalk.green(`🚀 正在创建项目：${projectName}...`))
        fs.mkdirSync(projectPath)

        // 创建项目文件
        createProjectFiles(projectPath, projectName)

        // 如果用户选择安装依赖
        if (installDeps) {
            console.log(chalk.blue(`🔧 安装依赖：`))
            try {
                execSync('npm install', { stdio: 'inherit', cwd: projectPath })
                console.log(chalk.green(`✅ 依赖安装成功！`))
            } catch (error) {
                console.log(chalk.red(`❌ 依赖安装失败: ${error.message}`))
            }
        }

        // 提示成功
        console.log(chalk.green('✅ 项目创建成功！'))

        // 提示用户下一步操作
        console.log(chalk.blue(`💻 进入项目目录：`))
        console.log(chalk.cyan(`cd ${projectName}`)) // 提示用户进入项目目录

        if (!installDeps) {
            console.log(chalk.blue(`🔧 安装依赖：`))
            console.log(chalk.cyan(`npm install`)) // 提示用户运行 `npm install`
        }

        console.log(chalk.blue(`🚀 启动开发环境：`))
        console.log(chalk.cyan(`npm run dev`)) // 提示用户启动开发环境

        console.log(chalk.blue(`⚙️ 打包项目：`))
        console.log(chalk.cyan(`npm run build`)) // 提示用户运行 `npm run build`

        console.log(chalk.blue(`🚀 启动生产环境：`))
        console.log(chalk.cyan(`npm start`)) // 提示用户启动生产环境

        // 添加用户提示：如何访问示例路由
        console.log(chalk.green(`✅ 项目启动后，您可以通过以下 URL 访问示例路由：`))
        console.log(chalk.cyan(`http://localhost:8899/node-express/example`)) // 提示用户访问示例路由
    })

program.parse(process.argv)

import { buildPackageJsonFile } from './files/package.json.file.js'
import { tsconfigFile } from './files/tsconfig.json.file.js'
import { esbuildFile } from './files/esbuild.file.js'
import { envDevelopmentFile } from './files/env.development.file.js'
import { envProductionFile } from './files/env.production.file.js'
import { appFile } from './files/app.ts.file.js'
import { consoleFile } from './files/console.ts.file.js'
import { loadEnvFile } from './files/loadEnv.ts.file.js'
import { loadRoutesFile } from './files/loadRoutes.ts.file.js'
import { requestLoggerFile } from './files/requestLogger.ts.file.js'
import { httpResponseFile } from './files/httpResponse.ts.file.js'
import { loggerFile } from './files/logger.ts.file.js'
import { globalTypeFile } from './files/global.d.ts.file.js'
import { middlewareTypeFile } from './files/middleware.d.ts.file.js'
import { exampleRouteFile } from './files/example.ts.file.js'

// 创建项目文件
function createProjectFiles(projectPath, projectName) {
    // package.json 
    fs.writeFileSync(path.join(projectPath, "package.json"), buildPackageJsonFile(projectName))

    // tsconfig.json
    fs.writeFileSync(path.join(projectPath, "tsconfig.json"), tsconfigFile)

    // esbuild.js
    fs.writeFileSync(path.join(projectPath, "esbuild.js"), esbuildFile)

    // .env.development
    fs.writeFileSync(path.join(projectPath, ".env.development"), envDevelopmentFile)

    // .env.production
    fs.writeFileSync(path.join(projectPath, ".env.production"), envProductionFile)

    // src
    fs.mkdirSync(path.join(projectPath, "src"))

    // src/app.ts
    fs.writeFileSync(path.join(projectPath, "src/app.ts"), appFile)

    // src/console.ts
    fs.writeFileSync(path.join(projectPath, "src/console.ts"), consoleFile)

    // src/loadEnv.ts
    fs.writeFileSync(path.join(projectPath, "src/loadEnv.ts"), loadEnvFile)

    // src/loadRoutes.ts
    fs.writeFileSync(path.join(projectPath, "src/loadRoutes.ts"), loadRoutesFile)

    // src/middlewares
    fs.mkdirSync(path.join(projectPath, "src/middlewares"))

    // src/middlewares/requestLogger.ts
    fs.writeFileSync(path.join(projectPath, "src/middlewares/requestLogger.ts"), requestLoggerFile)

    // src/middlewares/httpResponse.ts
    fs.writeFileSync(path.join(projectPath, "src/middlewares/httpResponse.ts"), httpResponseFile)

    // src/utils
    fs.mkdirSync(path.join(projectPath, "src/utils"))

    // src/utils/logger.ts
    fs.writeFileSync(path.join(projectPath, "src/utils/logger.ts"), loggerFile)

    // src/types
    fs.mkdirSync(path.join(projectPath, "src/types"))

    // src/types/global.d.ts
    fs.writeFileSync(path.join(projectPath, "src/types/global.d.ts"), globalTypeFile)

    // src/types/middleware.d.ts
    fs.writeFileSync(path.join(projectPath, "src/types/middleware.d.ts"), middlewareTypeFile)

    // src/routes
    fs.mkdirSync(path.join(projectPath, "src/routes"))

    // src/routes/example.ts
    fs.writeFileSync(path.join(projectPath, "src/routes/example.ts"), exampleRouteFile)
}
