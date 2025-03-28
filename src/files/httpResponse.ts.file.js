export const httpResponseFile = `import type Middleware from '@/types/middleware'

class HttpResponse {
    code: number
    msg: string
    data: any

    constructor(code: number, msg: string, data?: any) {
        this.code = code
        this.msg = msg
        this.data = data
    }
}


module.exports = ((req, resp, next) => {
    resp.success = function (msg, data) {
        this.send(new HttpResponse(200, msg, data))
    }

    resp.fail = function (error) {
        console.cliError(error)
        resp.send(new HttpResponse(400, error.message))
    }

    resp.authFail = function (error) {
        console.cliError(error)
        resp.send(new HttpResponse(401, error.message))
    }

    next()
}) as Middleware`
