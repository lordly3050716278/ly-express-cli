export const uploadRouteTemplate = `import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomHash } from 'jsly'
import { buildTempUrl } from '@/utils/fs'

const router = Router()

// 创建 temp 目录（如果不存在）
if (!fs.existsSync(process.env.TEMP_PATH)) {
    fs.mkdirSync(process.env.TEMP_PATH)
}

// 自定义存储配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.TEMP_PATH)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) // 提取扩展名
        const newName = \`\${randomHash()}\${ext}\` // 自定义文件名
        cb(null, newName)
    }
})

const upload = multer({ storage })

// 上传文件
router.post('/', upload.single('file'),
    (req, resp) => {
        try {
            if (!req.file) throw new Error('上传失败，请上传文件')

            const filename = req.file.filename
            const url = buildTempUrl(filename)
            resp.success('', url)
        } catch (error: any) {
            resp.fail(error)
        }
    }
)

export default router`