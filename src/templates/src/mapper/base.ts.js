export const baseMapperTemplate = `import type { PoolConnection, ResultSetHeader } from 'mysql2/promise'
import type { IBaseMapper, WhereCondition } from '@/types/baseMapper'
import { pool } from '@/utils/mysql'
import logger from '@/utils/logger'
import { snakeToCamel, camelToSnake } from 'jsly'
import { buildAssetsUrl } from '@/utils/fs'

export abstract class BaseMapper<T> implements IBaseMapper<T> {
    abstract tableName: string
    #conn: PoolConnection | null = null

    // 静态事务管理
    private static transactionConn: PoolConnection | null = null
    private static transactionCount: number = 0

    private async connect() {
        if (this.#conn) return
        this.#conn = await pool.getConnection()
    }

    private release() {
        if (!this.#conn) return
        this.#conn.release()
        this.#conn = null
    }

    /**
     * 开始事务
     * @returns 当前连接
     */
    async beginTransaction(): Promise<PoolConnection> {
        // 如果已经在事务中，增加事务计数并返回当前事务连接
        if (BaseMapper.transactionConn) {
            BaseMapper.transactionCount++
            return BaseMapper.transactionConn
        }

        // 否则创建新的事务连接
        await this.connect()
        if (!this.#conn) throw new Error('无法获取数据库连接')

        await this.#conn.beginTransaction()

        // 设置静态事务连接
        BaseMapper.transactionConn = this.#conn
        BaseMapper.transactionCount = 1

        return this.#conn
    }

    /**
     * 提交事务
     */
    async commit(): Promise<void> {
        // 如果不在事务中，直接返回
        if (!BaseMapper.transactionConn) return

        // 减少事务计数
        BaseMapper.transactionCount--

        // 只有当所有嵌套事务都完成时，才真正提交事务
        if (BaseMapper.transactionCount > 0) return
        await BaseMapper.transactionConn.commit()
        BaseMapper.transactionConn = null
        BaseMapper.transactionCount = 0
    }

    /**
     * 回滚事务
     */
    async rollback(): Promise<void> {
        // 如果不在事务中，直接返回
        if (!BaseMapper.transactionConn) return

        // 回滚事务，重置所有状态
        await BaseMapper.transactionConn.rollback()
        BaseMapper.transactionConn = null
        BaseMapper.transactionCount = 0
    }

    /**
     * 执行事务
     * @param callback 事务回调函数
     * @returns 事务执行结果
     */
    async transaction<T>(callback: () => Promise<T>): Promise<T> {
        try {
            await this.beginTransaction()
            const result = await callback()
            await this.commit()
            return result
        } catch (error) {
            await this.rollback()
            throw error
        } finally {
            // 只有在事务完全结束时才释放连接
            if (!BaseMapper.transactionConn) {
                this.release()
            }
        }
    }

    async query(sql: string, ...values: any[]) {
        // 如果已经在事务中，使用事务连接
        if (BaseMapper.transactionConn) {
            try {
                logger.log(\`\${sql} [\${values}]\`)
                const [result, fields] = await BaseMapper.transactionConn.query(sql, values)
                if (!Array.isArray(result)) return result as ResultSetHeader
                return result.map(snakeObjToCamelObj) as T[]
            } catch (error) {
                throw error
            }
        }

        // 否则使用普通连接
        await this.connect()
        if (!this.#conn) return []
        try {
            logger.log(\`\${sql} [\${values}]\`)
            const [result, fields] = await this.#conn.query(sql, values)
            if (!Array.isArray(result)) return result as ResultSetHeader
            return result.map(snakeObjToCamelObj) as T[]
        } finally {
            this.release()
        }
    }

    async insert(entity: Partial<T>) {
        const insertClause = \`(\${Object.keys(camelObjToSnakeObj(entity)).join(', ')}) VALUES (\${Object.keys(entity).map(() => '?').join(', ')})\`
        const sql = \`INSERT INTO \${this.tableName} \${insertClause}\`
        const values = [...Object.values(entity)]

        const result = await this.query(sql, ...values)
        return result as ResultSetHeader
    }

    async delete(where?: WhereCondition<T>) {
        const { clause, values } = this.buildWhereClause(where)
        const sql = \`DELETE FROM \${this.tableName} \${clause}\`
        const result = await this.query(sql, ...values)
        return result as ResultSetHeader
    }

    async update(id: number, data: Partial<T>) {
        const snakeData = camelObjToSnakeObj(data)
        const setClause = Object.keys(snakeData)
            .map(key => \`\${key} = ?\`)
            .join(', ')
        const sql = \`UPDATE \${this.tableName} SET \${setClause} WHERE id = ?\`
        const values = [...Object.values(data), id]

        const result = await this.query(sql, ...values)
        return result as ResultSetHeader
    }

    async getList(where?: WhereCondition<T>, orderBy: string = 'id DESC', ...fields: (keyof T)[]) {
        const fieldList = fields.length > 0
            ? fields.map(field => camelToSnake(field as string)).join(', ')
            : '*'
        const { clause, values } = this.buildWhereClause(where)
        const sql = \`SELECT \${fieldList} FROM \${this.tableName} \${clause} ORDER BY \${orderBy}\`

        const result = await this.query(sql, ...values)
        return result as T[]
    }

    async getOne(where: WhereCondition<T>, ...fields: (keyof T)[]) {
        const fieldList = fields.length > 0
            ? fields.map(field => camelToSnake(field as string)).join(', ')
            : '*'
        const { clause, values } = this.buildWhereClause(where)
        const sql = \`SELECT \${fieldList} FROM \${this.tableName} \${clause} LIMIT 1\`

        const result = await this.query(sql, ...values)
        return (result as T[])[0] || null
    }

    async getPage(pageNo: number, pageSize: number, where?: WhereCondition<T>, orderBy: string = 'id DESC', ...fields: (keyof T)[]) {
        const fieldList = fields.length > 0
            ? fields.map(field => camelToSnake(field as string)).join(', ')
            : '*'
        const { clause, values } = this.buildWhereClause(where)

        // 计算总数
        const countSql = \`SELECT COUNT(id) as total FROM \${this.tableName} \${clause}\`
        const [countResult] = await this.query(countSql, ...values) as any[]
        const total = countResult.total

        // 查询分页数据
        const offset = (pageNo - 1) * pageSize
        const sql = \`SELECT \${fieldList} FROM \${this.tableName} \${clause} ORDER BY \${orderBy} LIMIT ? OFFSET ?\`
        const records = await this.query(sql, ...values, pageSize, offset) as T[]

        return this.createPageResult(records, total, pageNo, pageSize)
    }

    async getPageBySql(sql: string, pageNo: number, pageSize: number, ...values: any[]) {
        // 计算总数
        const [countResult] = await this.query(\`SELECT COUNT(*) as total FROM (\${sql}) as _count\`, ...values) as any[]
        const total = countResult.total

        // 查询分页数据
        const offset = (pageNo - 1) * pageSize
        const records = await this.query(\`\${sql} LIMIT ? OFFSET ?\`, ...values, pageSize, offset) as T[]

        return this.createPageResult(records, total, pageNo, pageSize)
    }

    /**
     * 更新表的自增ID值
     * @param value 新的自增起始值
     * @returns 执行结果
     */
    async updateAutoIncrement(value: number): Promise<ResultSetHeader> {
        const sql = \`ALTER TABLE \${this.tableName} AUTO_INCREMENT = ?\`
        const result = await this.query(sql, value)
        return result as ResultSetHeader
    }

    // 工具方法
    private buildWhereClause(where?: WhereCondition<T>): { clause: string; values: any[] } {
        if (!where || !Object.keys(where).length) {
            return {
                clause: '',
                values: []
            }
        }

        const values: any[] = []
        const clauses: string[] = []

        // 处理普通条件
        const normalConditions = Object.entries(where).filter(([key]) => key !== '$or')
        if (normalConditions.length > 0) {
            const normalClauses = normalConditions.map(([key, value]) => {
                if (key.includes(' ')) {
                    // 处理特殊条件，如 'age >', 'name LIKE'
                    const [fieldName, operator] = key.split(' ')
                    const field = camelToSnake(fieldName)
                    if (Array.isArray(value)) {
                        values.push(...value)
                        return \`\${field} \${operator} (\${value.map(() => '?').join(', ')})\`
                    }
                    values.push(value)
                    return \`\${field} \${operator} ?\`
                }
                // 处理普通等于条件
                const field = camelToSnake(key)
                values.push(value)
                return \`\${field} = ?\`
            })
            clauses.push(\`(\${normalClauses.join(' AND ')})\`)
        }

        // 处理 OR 条件
        if ('$or' in where) {
            const orClauses = Object.entries(where.$or!).map(([key, value]) => {
                if (key.includes(' ')) {
                    // 处理特殊条件，如 'age >', 'name LIKE'
                    const [fieldName, operator] = key.split(' ')
                    const field = camelToSnake(fieldName)
                    if (Array.isArray(value)) {
                        values.push(...value)
                        return \`\${field} \${operator} (\${value.map(() => '?').join(', ')})\`
                    }
                    values.push(value)
                    return \`\${field} \${operator} ?\`
                }
                // 处理普通等于条件
                const field = camelToSnake(key)
                values.push(value)
                return \`\${field} = ?\`
            })
            clauses.push(\`(\${orClauses.join(' OR ')})\`)
        }

        return {
            clause: \`WHERE \${clauses.join(' OR ')}\`,
            values
        }
    }

    /**
     * 创建分页结果对象
     * @param records 当前页的记录
     * @param total 总记录数
     * @param pageNo 当前页码
     * @param pageSize 每页记录数
     * @returns 分页结果对象
     */
    private createPageResult<T>(records: T[], total: number, pageNo: number, pageSize: number) {
        return {
            records,
            pageNo,
            pageSize,
            pages: Math.ceil(total / pageSize),
            total
        }
    }
}

/**
 * 将下划线格式的键的对象的转换为小驼峰格式的键的对象
 */
function snakeObjToCamelObj(snakeKeyObject: Record<string, any>) {
    const camelKeyObject = {} as Record<string, any>
    for (const key in snakeKeyObject) {
        camelKeyObject[snakeToCamel(key)] = snakeKeyObject[key]
    }
    return camelKeyObject
}

/**
 * 将小驼峰格式的键的对象的转换为下划线格式的键的对象
 */
function camelObjToSnakeObj(camelKeyObject: Record<string, any>) {
    const snakeKeyObject = {} as Record<string, any>
    for (const key in camelKeyObject) {
        snakeKeyObject[camelToSnake(key)] = camelKeyObject[key]
    }
    return snakeKeyObject
}`