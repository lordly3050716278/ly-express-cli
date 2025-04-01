export const expressTypeFile = `namespace Express {
    interface Response {

        /**
         * 响应体
         */
        body?: any

        /**
        * 发送正确的响应给前端
        * 
        * @param msg 返回的信息
        * @param data 返回的数据
        */
        success(msg: string, data?: any): void

        /**
        * 发送错误的响应给前端，并在控制台打印错误信息
        * 
        * @param error 错误对象
        */
        fail(error: Error): void

        /**
        * 发送登录信息错误的响应给前端，并在控制台打印错误信息
        * 
        * @param error 错误对象
        */
        authFail(error: Error): void
    }
}`