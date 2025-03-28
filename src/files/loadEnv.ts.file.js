export const loadEnvFile = `import path from 'path'
import dotenv from 'dotenv'

console.cliLog('开始加载环境变量')
const CURR_ENV = process.env.NODE_ENV ?? 'development'
console.cliLog(\`当前环境 \${ CURR_ENV }\`)

const envPath = path.join(__dirname, '..', \`\.env.\${ CURR_ENV }\`)

try {
    dotenv.config({ path: envPath })

    console.cliSuccess(\`加载 [\${ envPath }] 成功\`)
} catch (error) {
    console.cliError(\`加载 [\${ envPath }] 失败: \${ error }\`)
    process.exit(1)
} `