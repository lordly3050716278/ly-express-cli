export const mysqlTemplate = `import type { TypeCastField } from 'mysql2'
import mysql from 'mysql2/promise'
import dayjs from 'dayjs'

function typeCast(field: TypeCastField, next: () => any) {
    if (field.type === 'TINY') return !!Number(field.string())

    if (field.type === 'TIMESTAMP') return dayjs(field.string()).format('YYYY-MM-DD HH:mm:ss')

    return next()
}

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    typeCast
})`