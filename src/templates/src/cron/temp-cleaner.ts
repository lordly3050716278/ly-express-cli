import cron from 'node-cron'
import fs from 'fs'
import path from 'path'

const TEMP_PATH = process.env.TEMP_PATH

async function main() {
    if (!TEMP_PATH) {
        console.cliError('[temp-cleaner] TEMP_PATH 未设置')
        return
    }

    if (!fs.existsSync(TEMP_PATH)) return

    try {
        const files = await fs.promises.readdir(TEMP_PATH)
        for (const file of files) {
            const filePath = path.join(TEMP_PATH, file)

            try {
                await fs.promises.unlink(filePath)
                console.cliSuccess(`[temp-cleaner] 删除文件：${file}`)
            } catch (err) {
                console.cliError(`[temp-cleaner] 删除失败：${file}`)
            }
        }
    } catch (error) {
        console.cliError('[temp-cleaner] 执行失败')
        console.error(error)
    }
}

// 每小时执行一次
cron.schedule('0 * * * *', () => {
    (async () => {
        console.cliLog('[temp-cleaner] 正在清理临时文件...')
        await main()
        console.cliLog('[temp-cleaner] 清理完成')
    })()
})
