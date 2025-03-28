export const tsconfigFile = JSON.stringify({
    "compilerOptions": {
        "target": "ES2024",
        "module": "CommonJS",
        "rootDir": "src",
        "outDir": "dist",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "moduleResolution": "node",
        "sourceMap": true,
        "baseUrl": ".",
        "paths": {
            "@/*": [
                "src/*"
            ]
        }
    },
    "include": [
        "src/**/*.ts"
    ],
    "exclude": [
        "node_modules"
    ]
}, null, 2)