export const verifyCodeTemplate = `import { sendMail } from './email'
import * as redis from './redis'
import logger from './logger'

// 验证码过期时间 5 分钟
const CODE_EXPIRE_SECONDS = 300

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function getVerifyCodeHtml(code: string) {
  return \`
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">您的验证码</h2>
        <p style="font-size: 16px; color: #555;">请使用下面的验证码完成操作：</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2d8cf0; margin: 20px 0;">
          \${code}
        </div>
        <p style="font-size: 14px; color: #999;">验证码有效期为 \${CODE_EXPIRE_SECONDS / 60} 分钟，请勿泄露给他人。</p>
      </div>
    </div>
  \`
}

function getVerifyCodeKey(email: string) {
  return \`verify:email:\${email}\`
}

export async function sendVerifyCode(email: string) {
  const code = generateCode()
  const html = getVerifyCodeHtml(code)

  await sendMail({
    to: email,
    subject: '邮箱验证码',
    html
  })

  // 保存到 Redis
  const key = getVerifyCodeKey(email)
  await redis.set(key, code, CODE_EXPIRE_SECONDS)

  logger.log(\`验证码 \${code} 已保存到 Redis（key=\${key}，\${CODE_EXPIRE_SECONDS}s）\`)

  return code
}

/**
 * 获取 Redis 中存储的验证码
 */
export async function getVerifyCode(email: string): Promise<string | null> {
  const key = getVerifyCodeKey(email)
  return await redis.get(key)
}

/**
 * 校验验证码是否正确
 */
export async function validateCode(email: string, inputCode: string) {
  const realCode = await getVerifyCode(email)

  if (!realCode) throw new Error('验证码不存在或已过期')

  if (realCode !== inputCode) throw new Error('验证码不正确')

  // 验证成功，删除 Redis 中验证码
  await redis.del(getVerifyCodeKey(email))
}`