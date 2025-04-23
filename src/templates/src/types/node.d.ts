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

        /**
        * 数据库主机地址
        */
        DB_HOST: string

        /**
         * 数据库用户名
         */
        DB_USER: string

        /**
         * 数据库密码
         */
        DB_PASSWORD: string

        /**
         * 数据库名称
         */
        DB_DATABASE: string

        /**
         * 邮件服务主机地址
         */
        MAIL_HOST: string

        /**
         * 邮件服务用户名
         */
        MAIL_USER: string

        /**
         * 邮件服务密码
         */
        MAIL_PASS: string

        /**
         * 静态资源文件路径
         */
        ASSETS_PATH: string

        /**
         * 静态资源文件上下文路径
         */
        ASSETS_CONTEXT_PATH: string

        /**
         * 静态资源访问 URL
         */
        ASSETS_URL: string

        /**
         * 临时文件路径
         */
        TEMP_PATH: string

        /**
         * 临时文件上下文路径
         */
        TEMP_CONTEXT_PATH: string

        /**
         * 临时文件访问 URL
         */
        TEMP_URL: string

        /**
         * 允许访问静态资源的referer
         */
        REFERERS: string
    }
}