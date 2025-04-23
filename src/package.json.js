export const createPackageJson = (projectName) => {
    return JSON.stringify({
        "name": projectName,
        "scripts": {
            "dev": "ts-node-dev -r tsconfig-paths/register --respawn --transpile-only --cls --watch src src/app.ts",
            "build": "node esbuild.js",
            "start": "node dist/app.js"
        },
        "dependencies": {
            "cli-color": "^2.0.4",
            "cors": "^2.8.5",
            "dayjs": "^1.11.13",
            "dotenv": "^16.4.7",
            "express": "^4.21.2",
            "ioredis": "^5.6.1",
            "multer": "^1.4.5-lts.2",
            "mysql2": "^3.14.0",
            "node-cron": "^3.0.3",
            "nodemailer": "^6.10.1",
            "jsly": "^2.0.6"
        },
        "devDependencies": {
            "@types/cli-color": "^2.0.6",
            "@types/cors": "^2.8.17",
            "@types/express": "^5.0.0",
            "@types/ioredis": "^4.28.10",
            "@types/multer": "^1.4.12",
            "@types/node": "^22.13.10",
            "@types/node-cron": "^3.0.11",
            "@types/nodemailer": "^6.4.17",
            "esbuild": "^0.25.1",
            "ts-node-dev": "^2.0.0",
            "tsconfig-paths": "^4.2.0",
            "typescript": "^5.8.2"
        }
    }, null, 2)
}
