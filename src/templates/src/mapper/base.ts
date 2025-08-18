import type { PoolConnection, ResultSetHeader } from 'mysql2/promise'
import type { IBaseMapper, WhereCondition, ListConfig } from '@/types/baseMapper'
import { pool } from '@/utils/mysql'
import { snakeToCamel, camelToSnake } from 'jsly'

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
        sql = sql.replace(/\s+/g, ' ').trim()

        // 如果已经在事务中，使用事务连接
        if (BaseMapper.transactionConn) {
            try {
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
            const [result, fields] = await this.#conn.query(sql, values)
            if (!Array.isArray(result)) return result as ResultSetHeader
            return result.map(snakeObjToCamelObj) as T[]
        } finally {
            this.release()
        }
    }

    async insert(entity: Partial<T>) {
        const insertClause = `(${Object.keys(camelObjToSnakeObj(entity)).join(', ')}) VALUES (${Object.keys(entity).map(() => '?').join(', ')})`
        const sql = `INSERT INTO ${this.tableName} ${insertClause}`
        const values = [...Object.values(entity)]

        const result = await this.query(sql, ...values)
        return result as ResultSetHeader
    }

    async delete(where?: WhereCondition<T>) {
        const { clause, values } = this.buildWhereClause(where)
        const sql = `DELETE FROM ${this.tableName} ${clause}`
        const result = await this.query(sql, ...values)
        return result as ResultSetHeader
    }

    async updateById(id: number, data: Partial<T>) {
        const snakeData = camelObjToSnakeObj(data)
        const setClause = Object.keys(snakeData)
            .map(key => `${key} = ?`)
            .join(', ')
        const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`
        const values = [...Object.values(data), id]

        const result = await this.query(sql, ...values)
        return result as ResultSetHeader
    }

    async updateByWhere(where: WhereCondition<T>, data: Partial<T>): Promise<ResultSetHeader> {
        const snakeData = camelObjToSnakeObj(data)
        const setClause = Object.keys(snakeData)
            .map(key => `${key} = ?`)
            .join(', ')
        const { clause, values } = this.buildWhereClause(where)
        const sql = `UPDATE ${this.tableName} SET ${setClause} ${clause}`
        const updateValues = [...Object.values(data), ...values]

        const result = await this.query(sql, ...updateValues)
        return result as ResultSetHeader
    }

    async getList(
        where?: WhereCondition<T>,
        config: ListConfig = {
            order: 'id DESC'
        },
        ...fields: (keyof T)[]) {
        let fieldList = '*'
        if (fields.length > 0) {
            fieldList = fields.map(field => camelToSnake(field as string)).join(', ')
        }

        const { clause: whereClause, values } = this.buildWhereClause(where)
        let sql = `SELECT ${fieldList} FROM ${this.tableName} ${whereClause}`

        config.order && (sql += ` ORDER BY ${config.order}`)
        config.limit && (sql += ` LIMIT ${config.limit}`)

        const result = await this.query(sql, ...values)
        return result as T[]
    }

    async getOne(where?: WhereCondition<T>, ...fields: (keyof T)[]) {
        const result = await this.getList(where, undefined, ...fields)
        return result[0] || null
    }

    async count(where?: WhereCondition<T>): Promise<number> {
        const { clause, values } = this.buildWhereClause(where)
        const sql = `SELECT COUNT(*) as total FROM ${this.tableName} ${clause}`
        const [result] = await this.query(sql, ...values) as any[]
        return result.total
    }

    async increase(where: WhereCondition<T>, ...fields: (keyof T)[]): Promise<ResultSetHeader> {
        return this.updateFieldsByStep(where, fields, 1)
    }

    async decrease(where: WhereCondition<T>, ...fields: (keyof T)[]): Promise<ResultSetHeader> {
        return this.updateFieldsByStep(where, fields, -1)
    }

    async updateFieldsByStep(where: WhereCondition<T>, fields: (keyof T)[], step: number): Promise<ResultSetHeader> {
        if (!fields.length) throw new Error('必须指定至少一个字段')

        const setClause = fields
            .map(field => {
                const col = camelToSnake(field as string)
                return `${col} = ${col} ${step > 0 ? '+' : '-'} ${Math.abs(step)}`
            })
            .join(', ')

        const { clause, values } = this.buildWhereClause(where)
        const sql = `UPDATE ${this.tableName} SET ${setClause} ${clause}`

        const result = await this.query(sql, ...values)
        return result as ResultSetHeader
    }

    /**
     * 更新表的自增ID值
     * @param value 新的自增起始值
     * @returns 执行结果
     */
    async updateAutoIncrement(value: number): Promise<ResultSetHeader> {
        const sql = `ALTER TABLE ${this.tableName} AUTO_INCREMENT = ?`
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
                        return `${field} ${operator} (${value.map(() => '?').join(', ')})`
                    }
                    values.push(value)
                    return `${field} ${operator} ?`
                }
                // 处理普通等于条件
                const field = camelToSnake(key)
                values.push(value)
                return `${field} = ?`
            })
            clauses.push(`(${normalClauses.join(' AND ')})`)
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
                        return `${field} ${operator} (${value.map(() => '?').join(', ')})`
                    }
                    values.push(value)
                    return `${field} ${operator} ?`
                }
                // 处理普通等于条件
                const field = camelToSnake(key)
                values.push(value)
                return `${field} = ?`
            })
            clauses.push(`(${orClauses.join(' OR ')})`)
        }

        return {
            clause: `WHERE ${clauses.join(' OR ')}`,
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
}