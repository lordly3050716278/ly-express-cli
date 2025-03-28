# ly-express-cli

## 项目简介

**ly-express-cli** 是一个用于快速创建 Express + TypeScript 接口项目的脚手架工具。通过该工具，您可以快速生成项目的基础框架，包含配置文件、路由、中间件、示例代码等，帮助您高效地启动和开发 API 项目。

## 功能特点

- 快速创建 Express + TypeScript 项目。
- 自动生成基础配置文件，如 `tsconfig.json`、`esbuild.js`、`.env` 等。
- 提供预设的路由和中间件，帮助快速实现常见功能。
- 支持选择是否安装依赖。
- 提供了开发、打包、生产环境等常用命令提示。

## 安装

在使用 `ly-express-cli` 前，您需要先将其安装为全局命令工具：

```bash
npm install -g ly-express-cli
```

## 使用

### 初始化一个新项目

创建新项目的命令如下：

```bash
node-express init
```

运行此命令后，系统会提示您输入项目名称，并选择是否安装项目的依赖。完成后，您将获得一个完整的 Express + TypeScript 项目框架。

### 命令行操作流程

1. **创建项目目录**
   系统会自动根据您提供的项目名称创建相应的项目目录，并在其中生成所有基础文件。
   
2. **是否安装依赖**
   在项目初始化过程中，系统会询问您是否安装依赖。如果选择安装，系统将自动运行 `npm install`。

3. **进入项目目录**
   项目创建完成后，您可以进入项目目录：

   ```bash
   cd 项目名称
   ```

4. **安装项目依赖**
   如果您在创建项目时没有选择自动安装依赖，您可以手动运行以下命令：

   ```bash
   npm install
   ```

5. **启动开发环境**
   安装完依赖后，您可以启动开发环境：

   ```bash
   npm run dev
   ```

6. **打包项目**
   如果您需要将项目打包，可以运行以下命令：

   ```bash
   npm run build
   ```

7. **启动生产环境**
   完成打包后，您可以启动生产环境：

   ```bash
   npm start
   ```

### 可选步骤

- 如果您希望跳过某些步骤，例如不安装依赖，系统会提供相应的提示，您可以按需执行。

## 创建的项目结构

创建的项目包含以下文件和文件夹：

```
/project-name
  ├── /node_modules        # 项目依赖
  ├── /src                 # 项目源代码
  │   ├── /middlewares     # 存放中间件
  │   ├── /utils           # 存放工具函数
  │   ├── /types           # 存放类型定义
  │   ├── /routes          # 存放路由
  │   └── app.ts           # Express 应用的主入口文件
  ├── package.json         # 项目的基本配置文件
  ├── tsconfig.json        # TypeScript 配置文件
  ├── esbuild.js           # 构建配置文件
  ├── .env.development     # 开发环境变量配置
  └── .env.production      # 生产环境变量配置
```

## 常见问题解答 (FAQ)

1. **如何修改项目配置？**
   您可以根据需要修改生成的 `tsconfig.json`、`esbuild.js`、`package.json` 等配置文件。项目已根据最佳实践配置，您可以根据项目需求调整。

2. **如何扩展功能？**
   `ly-express-cli` 创建的项目结构是模块化的，您可以在 `src/middlewares/` 中添加新的中间件，在 `src/routes/` 中添加新的路由，在 `src/utils/` 中添加工具函数等。

3. **如何运行测试？**
   项目模板默认不包含测试配置，您可以根据需求添加测试框架（如 Jest、Mocha 等）来编写测试。

4. **如何打包项目？**
   在项目根目录运行 `npm run build`，该命令会使用 `esbuild` 将 TypeScript 项目打包为 JavaScript 文件。

5. **如何处理环境变量？**
   项目模板包含 `.env.development` 和 `.env.production` 文件。您可以在这些文件中添加需要的环境变量，`dotenv` 会自动加载这些配置。

## 贡献

欢迎对 `ly-express-cli` 提出意见和贡献代码！您可以：
- 创建 Issue 来反馈问题或建议。
- 提交 Pull Request，修复 bug 或添加新功能。

## License

该项目采用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

---

感谢使用 `ly-express-cli`，祝您开发愉快！😊