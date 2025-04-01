export const nodeTypeFile = `namespace NodeJS {
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
}`
