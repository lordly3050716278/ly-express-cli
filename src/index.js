#!/usr/bin/env node

import { program } from 'commander'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { execSync } from 'child_process'

// 指定版本和描述信息
program
    .version('0.0.4')
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
                { type: 'confirm', name: 'replaceDir', message: '目录已存在，是否覆盖？', default: true }
            ])
            if (!replaceDir) return

            try {
                console.log(chalk.yellow(`⚠️ 目录已存在，正在删除...`))
                fs.rmSync(projectPath, { recursive: true, force: true })

                // 等待 100ms 再检测
                await new Promise(r => setTimeout(r, 100))

                if (fs.existsSync(projectPath)) {
                    throw new Error(`❌ 删除失败，目录仍然存在`)
                }

                console.log(chalk.green(`✅ 目录删除成功！`))
            } catch (error) {
                console.log(chalk.red(`❌ 目录删除失败: ${error.message}`))
                return
            }
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

import { getTemplate } from './templates/package.json.js'
import { tsconfigTemplate } from './templates/tsconfig.json.js'
import { esbuildTemplate } from './templates/esbuild.js'
import { envTemplate } from './templates/env.js'
import { envDevelopmentTemplate } from './templates/env.development.js'
import { envProductionTemplate } from './templates/env.production.js'

import { appTemplate } from './templates/src/app.ts.js'
import { consoleTemplate } from './templates/src/console.ts.js'
import { loadEnvTemplate } from './templates/src/loadEnv.ts.js'
import { loadRoutesTemplate } from './templates/src/loadRoutes.ts.js'

import { consoleTypeTemplate } from './templates/src/types/console.d.ts.js'
import { jslyTypeTemplate } from './templates/src/types/jsly.d.ts.js'
import { nodeTypeTemplate } from './templates/src/types/node.d.ts.js'
import { expressTypeTemplate } from './templates/src/types/express.d.ts.js'
import { middlewareTypeTemplate } from './templates/src/types/middleware.d.ts.js'
import { baseMapperTypeTemplate } from './templates/src/types/baseMapper.d.ts.js'

import { loggerTemplate } from './templates/src/utils/logger.ts.js'
import { fsTemplate } from './templates/src/utils/fs.ts.js'
import { emailTemplate } from './templates/src/utils/email.ts.js'
import { redisTemplate } from './templates/src/utils/redis.ts.js'
import { verifyCodeTemplate } from './templates/src/utils/verifyCode.ts.js'
import { mysqlTemplate } from './templates/src/utils/mysql.ts.js'

import { requestLoggerTemplate } from './templates/src/middlewares/requestLogger.ts.js'
import { httpResponseTemplate } from './templates/src/middlewares/httpResponse.ts.js'
import { referTemplate } from './templates/src/middlewares/refer.ts.js'
import { requestParamsValidatorTemplate } from './templates/src/middlewares/requestParamsValidator.ts.js'

import { cronTemplate } from './templates/src/cron/index.ts.js'
import { tempClearCronTemplate } from './templates/src/cron/temp-cleaner.ts.js'

import { baseMapperTemplate } from './templates/src/mapper/base.ts.js'

import { uploadRouteTemplate } from './templates/src/routes/upload.ts.js'
import { verifyCodeRouteTemplate } from './templates/src/routes/verifyCode.ts.js'

// 创建项目文件
function createProjectFiles(projectPath, projectName) {
    fs.writeFileSync(path.join(projectPath, "package.json"), getTemplate(projectName))
    fs.writeFileSync(path.join(projectPath, "tsconfig.json"), tsconfigTemplate)
    fs.writeFileSync(path.join(projectPath, "esbuild.js"), esbuildTemplate)
    fs.writeFileSync(path.join(projectPath, ".env"), envTemplate)
    fs.writeFileSync(path.join(projectPath, ".env.development"), envDevelopmentTemplate)
    fs.writeFileSync(path.join(projectPath, ".env.production"), envProductionTemplate)

    fs.mkdirSync(path.join(projectPath, "src"))

    fs.writeFileSync(path.join(projectPath, "src/app.ts"), appTemplate)
    fs.writeFileSync(path.join(projectPath, "src/console.ts"), consoleTemplate)
    fs.writeFileSync(path.join(projectPath, "src/loadEnv.ts"), loadEnvTemplate)
    fs.writeFileSync(path.join(projectPath, "src/loadRoutes.ts"), loadRoutesTemplate)

    fs.mkdirSync(path.join(projectPath, "src/types"))

    fs.writeFileSync(path.join(projectPath, "src/types/console.d.ts"), consoleTypeTemplate)
    fs.writeFileSync(path.join(projectPath, "src/types/jsly.d.ts"), jslyTypeTemplate)
    fs.writeFileSync(path.join(projectPath, "src/types/node.d.ts"), nodeTypeTemplate)
    fs.writeFileSync(path.join(projectPath, "src/types/express.d.ts"), expressTypeTemplate)
    fs.writeFileSync(path.join(projectPath, "src/types/middleware.d.ts"), middlewareTypeTemplate)
    fs.writeFileSync(path.join(projectPath, "src/types/baseMapper.d.ts"), baseMapperTypeTemplate)

    fs.mkdirSync(path.join(projectPath, "src/utils"))

    fs.writeFileSync(path.join(projectPath, "src/utils/logger.ts"), loggerTemplate)
    fs.writeFileSync(path.join(projectPath, "src/utils/fs.ts"), fsTemplate)
    fs.writeFileSync(path.join(projectPath, "src/utils/email.ts"), emailTemplate)
    fs.writeFileSync(path.join(projectPath, "src/utils/redis.ts"), redisTemplate)
    fs.writeFileSync(path.join(projectPath, "src/utils/verifyCode.ts"), verifyCodeTemplate)
    fs.writeFileSync(path.join(projectPath, "src/utils/mysql.ts"), mysqlTemplate)

    fs.mkdirSync(path.join(projectPath, "src/middlewares"))

    fs.writeFileSync(path.join(projectPath, "src/middlewares/requestLogger.ts"), requestLoggerTemplate)
    fs.writeFileSync(path.join(projectPath, "src/middlewares/httpResponse.ts"), httpResponseTemplate)
    fs.writeFileSync(path.join(projectPath, "src/middlewares/refer.ts"), referTemplate)
    fs.writeFileSync(path.join(projectPath, "src/middlewares/requestParamsValidator.ts"), requestParamsValidatorTemplate)

    fs.mkdirSync(path.join(projectPath, "src/cron"))
    fs.writeFileSync(path.join(projectPath, "src/cron/index.ts"), cronTemplate)
    fs.writeFileSync(path.join(projectPath, "src/cron/temp-cleaner.ts"), tempClearCronTemplate)

    fs.mkdirSync(path.join(projectPath, "src/mapper"))

    fs.writeFileSync(path.join(projectPath, "src/mapper/base.ts"), baseMapperTemplate)

    fs.mkdirSync(path.join(projectPath, "src/routes"))

    fs.writeFileSync(path.join(projectPath, "src/routes/upload.ts"), uploadRouteTemplate)
    fs.writeFileSync(path.join(projectPath, "src/routes/verifyCode.ts"), verifyCodeRouteTemplate)
}
