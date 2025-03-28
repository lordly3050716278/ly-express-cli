export const esbuildFile = `const esbuild = require('esbuild')
const path = require('path')
const fs = require('fs')
const pkg = require('./package.json') // 读取 package.json

function clean() {
    const distPath = path.join(__dirname, 'dist')
    if (!fs.existsSync(distPath)) return
    fs.rmSync(distPath, { recursive: true })
}

function build() {
    clean()

    esbuild.build({
        entryPoints: ['src/app.ts', 'src/routes/**/*.ts'],        // 入口文件
        bundle: true,                       // 打包所有依赖
        platform: 'node',                   // Node.js 环境
        outdir: 'dist',                     // 输出文件
        minify: true,                       // 生产环境压缩代码
        sourcemap: false,                   // 开发环境生成 Source Map
        external: Object.keys(pkg.dependencies), // 排除所有 dependencies 中的依赖
        loader: {
            '.ts': 'ts',                    // 处理 TypeScript 文件
        },
        tsconfig: './tsconfig.json',        // 指定 tsconfig 文件
        define: {
            'process.env.NODE_ENV': \`"production"\` // 注入环境变量
        }
    }).then(() => {
        console.log('✅ 构建完成')
    }).catch((error) => {
        console.error('❌ 构建失败:', error)
        process.exit(1)
    })
}

build()`