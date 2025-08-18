import path from 'path'
import dotenv from 'dotenv'

console.cliLog('开始加载环境变量')
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development'
}
const CURR_ENV = process.env.NODE_ENV
console.cliLog(`当前环境 ${CURR_ENV}`)

const baseEnvPath = path.join(__dirname, '..', `.env`)
const envPath = path.join(__dirname, '..', `.env.${CURR_ENV}`)

try {
    dotenv.config({ path: baseEnvPath })
    dotenv.config({ path: envPath })

    const { BASE, PORT, CONTEXT_PATH } = process.env
    const ASSETS_CONTEXT_PATH = CONTEXT_PATH + '/assets'
    process.env.ASSETS_CONTEXT_PATH = ASSETS_CONTEXT_PATH
    process.env.ASSETS_URL = `${BASE}:${PORT}${ASSETS_CONTEXT_PATH}`

    process.env.TEMP_PATH = path.join(process.cwd(), 'temp')
    const TEMP_CONTEXT_PATH = CONTEXT_PATH + '/temp'
    process.env.TEMP_CONTEXT_PATH = TEMP_CONTEXT_PATH
    process.env.TEMP_URL = `${BASE}:${PORT}${TEMP_CONTEXT_PATH}`

    console.cliSuccess(`加载 [${envPath}] 成功`)
} catch (error) {
    console.cliError(`加载 [${envPath}] 失败: ${error}`)
    process.exit(1)
} 