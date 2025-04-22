export const referTemplate = `import type Middleware from '@/types/middleware'

// 设置允许的 Referer
const allowedDomains = process.env.REFERERS?.split(',') || []

module.exports = ((req, resp, next) => {
    const referer = req.get('Referer')

    // 检查是否有合法的 Referer
    if (!referer || !allowedDomains.some(domain => referer.startsWith(domain))) {
        // 如果没有合法来源，返回 403 错误
        resp.status(403).send('禁止访问')
        return
    }

    next()
}) as Middleware`