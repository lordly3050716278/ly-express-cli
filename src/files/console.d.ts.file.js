export const consoleTypeFile = `interface Console {
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
}`
