export const verifyCodeRouteTemplate = `import { Router } from 'express'
import { sendVerifyCode } from '@/utils/verifyCode'

const router = Router()

// 发送验证码
router.post('/', async (req, resp) => {
    try {
        const { valid: { email } } = req.paramsValidator('email')

        await sendVerifyCode(email)

        resp.success('验证码发送成功')
    } catch (error: any) {
        resp.fail(error)
    }
})

export default router`