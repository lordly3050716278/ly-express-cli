export const fsTemplate = `import fs from 'fs'

/**
 * 构建资源文件的可访问url
 * 
 * @param filename 文件名字
 */
export const buildAssetsUrl = (filename: string) => process.env.ASSETS_URL + '/' + filename

/**
 * 构建资源文件的路径path
 * 
 * @param filename 文件名字
 */
export const buildAssetsPath = (filename: string) => process.env.ASSETS_PATH + '/' + filename

/**
 * 构建临时文件的可访问url
 * 
 * @param filename 文件名字
 */
export const buildTempUrl = (filename: string) => process.env.TEMP_URL + '/' + filename

/**
 * 构建临时文件的路径path
 * 
 * @param filename 文件名字
 */
export const buildTempPath = (filename: string) => process.env.TEMP_PATH + '/' + filename

/**
 * 解析资源文件的url
 * 
 * @param url 资源文件的url
 */
export const resolveAssetsUrlFile = (url: string) => url.replace(process.env.ASSETS_URL + '/', '')

/**
 * 解析临时文件的url
 * 
 * @param url 临时文件的url
 */
export const resolveTempUrlFile = (url: string) => url.replace(process.env.TEMP_URL + '/', '')

/**
 * 删除静态资源目录中的文件
 * 
 * @param filenames 文件名
 */
export const deleteFile = (...filenames: string[]) => {
    filenames.forEach(filename => {
        const filePath = buildAssetsPath(filename)
        if (!fs.existsSync(filePath)) return
        fs.unlinkSync(filePath)
    })
}

/**
 * 复制静态目录中的文件
 * 
 * @param sourceFilename 源文件名
 * @param targetFilename 目标文件名
 */
export const copyFile = (sourceFilename: string, targetFilename: string) => {
    const sourcePath = buildAssetsPath(sourceFilename)
    const targetPath = buildAssetsPath(targetFilename)
    if (!fs.existsSync(sourcePath)) return
    fs.copyFileSync(sourcePath, targetPath)
}

/**
 * 删除临时文件目录中的文件
 * 
 * @param filenames 文件名
 */
export const deleteTempFile = (...filenames: string[]) => {
    filenames.forEach(filename => {
        const filePath = buildTempPath(filename)
        if (!fs.existsSync(filePath)) return
        fs.unlinkSync(filePath)
    })
}

/**
 * 将临时文件移动到静态资源目录中
 * 
 * @param filename 文件名
 */
export const moveTempFileToAssets = (filename: string) => {
    if (!fs.existsSync(process.env.ASSETS_PATH)) {
        fs.mkdirSync(process.env.ASSETS_PATH, { recursive: true })
    }
    const tempPath = buildTempPath(filename)
    const assetsPath = buildAssetsPath(filename)
    if (!fs.existsSync(tempPath)) return
    fs.copyFileSync(tempPath, assetsPath)
    fs.unlinkSync(tempPath)
}`