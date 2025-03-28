export const globalTypeFile = `interface Console {
    /**
     * 输出普通日志信息
     * 
     * @param args 警告内容，支持多个参数
     */
    cliLog(...agrs: any[]): void

    /**
    * 输出警告信息
    * 
    * @param args 警告内容，支持多个参数
    */
    cliWarn(...agrs: any[]): void

    /**
     * 输出错误信息
     * 
     * @param args 警告内容，支持多个参数
     */
    cliError(...args: any[]): void

    /**
     * 输出成功信息
     * 
     * @param args 警告内容，支持多个参数
     */
    cliSuccess(...args: any[]): void
}

namespace NodeJS {
    interface ProcessEnv {
        /**
        * 当前环境模式，可选值为 'development' 或 'production'
        */
        NODE_ENV: 'development' | 'production'

        /**
         * 服务器主机地址
         */
        HOST: string

        /**
         * 服务器端口号
         */
        PORT: number

        /**
         * 应用上下文路径
         */
        CONTEXT_PATH: string
    }
}

namespace Express {
    interface Response {
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