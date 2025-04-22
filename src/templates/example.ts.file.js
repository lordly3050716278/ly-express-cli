export const exampleRouteFile = `import { Router } from 'express'

const router = Router()

router.get('/get', (req, resp) => {
    resp.success('这是一个示例路由', { env: process.env.NODE_ENV, query: req.query })
})

router.post('/post', (req, resp) => {
    resp.success('这是一个示例路由', { env: process.env.NODE_ENV, body: req.body })
})

export default router`
