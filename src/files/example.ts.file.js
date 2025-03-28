export const exampleRouteFile = `import { Router } from 'express'

const router = Router()

router.get('/', (req, resp) => {
    resp.success('这是一个示例路由', { env: process.env.NODE_ENV })
})

export default router`
