declare module 'jsly' {
    /**
     * 生成随机的字符串
     */
    export function randomHash(): string

    /**
     * 将字符串由小驼峰转换为下划线
     * 
     * @param str 小驼峰格式的字符串
     */
    export function camelToSnake(str: string): string

    /**
     * 将字符串由下划线转换为小驼峰
     * 
     * @param str 下划线格式的字符串
     */
    export function snakeToCamel(str: string): string
}