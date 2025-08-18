import { sendVerificationCode } from './email'
import * as verifyCodeCache from './redis/verifyCodeCache'

// 验证码过期时间
const CODE_EXPIRE_SECONDS = 60 * 5

export async function sendVerifyCode(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  await sendVerificationCode(email, code, CODE_EXPIRE_SECONDS)

  await verifyCodeCache.setCache(email, code, CODE_EXPIRE_SECONDS)

  return code
}

/**
 * 获取 Redis 中存储的验证码
 */
export async function getVerifyCode(email: string): Promise<string | null> {
  return await verifyCodeCache.getCache(email)
}

/**
 * 校验验证码是否正确
 */
export async function validateCode(email: string, inputCode: string) {
  const realCode = await getVerifyCode(email)

  if (!realCode) throw new Error('验证码不存在或已过期')

  if (realCode !== inputCode) throw new Error('验证码不正确')

  // 验证成功，删除 Redis 中验证码
  await verifyCodeCache.delCache(email)
}