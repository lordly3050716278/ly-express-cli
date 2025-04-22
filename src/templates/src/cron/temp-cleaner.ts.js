export const tempClearCronTemplate = `import fs from 'fs'
import path from 'path'
import cron from 'node-cron'
import logger from '@/utils/logger'

const TEMP_PATH = process.env.TEMP_PATH

function clearTempDir() {
    if (!fs.existsSync(TEMP_PATH)) return

    const files = fs.readdirSync(TEMP_PATH)
    for (const file of files) {
        const filePath = path.join(TEMP_PATH, file)
        try {
            fs.unlinkSync(filePath)
            logger.success(\`[temp-cleaner] 删除文件：\${file}\`)
        } catch (err) {
            logger.error(\`[temp-cleaner] 删除失败：\${file}\`)
        }
    }
}

// 每小时执行一次
cron.schedule('0 * * * *', () => {
    logger.log('[temp-cleaner] 正在清理临时文件...')
    clearTempDir()
    logger.log('[temp-cleaner] 清理完成')
})
`