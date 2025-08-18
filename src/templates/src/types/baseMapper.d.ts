import type { ResultSetHeader, PoolConnection } from 'mysql2/promise'

type WhereOperator = '=' | '>' | '<' | '>=' | '<=' | '!=' | 'IN' | 'NOT IN' | 'LIKE' | 'NOT LIKE'

type WhereValue = string | number | boolean | null | (string | number)[]

type WhereCondition<T> = {
    [K in keyof T]?: WhereValue
} & {
    [K in `${string & keyof T} ${WhereOperator}`]?: WhereValue
} & {
    $or?: {
        [K in keyof T]?: WhereValue
    } & {
        [K in `${string & keyof T} ${WhereOperator}`]?: WhereValue
    }
}

type ListConfig = {
    order?: string
    limit?: number
}

interface PageResult<T> {
    records: T[]
    pageNo: number
    pageSize: number
    pages: number
    total: number
}

interface IBaseMapper<T> {
    tableName: string
    query(sql: string, ...values: any[]): Promise<T[] | ResultSetHeader>
    insert(entity: Partial<T>): Promise<ResultSetHeader>
    delete(where?: WhereCondition<T>): Promise<ResultSetHeader>
    updateById(id: number, data: Partial<T>): Promise<ResultSetHeader>
    updateByWhere(where: WhereCondition<T>, data: Partial<T>): Promise<ResultSetHeader>
    getList(where?: WhereCondition<T>, config?: ListConfig, ...fields: (keyof T)[]): Promise<T[]>
    getOne(where: WhereCondition<T>, ...fields: (keyof T)[]): Promise<T | null>
    count(where?: WhereCondition<T>): Promise<number>
    increase(where: WhereCondition<T>, ...fields: (keyof T)[]): Promise<ResultSetHeader>
    decrease(where: WhereCondition<T>, ...fields: (keyof T)[]): Promise<ResultSetHeader>
    updateFieldsByStep(where: WhereCondition<T>, fields: (keyof T)[], step: number): Promise<ResultSetHeader>

    // 事务相关方法
    beginTransaction(): Promise<PoolConnection>
    commit(): Promise<void>
    rollback(): Promise<void>
    transaction<T>(callback: () => Promise<T>): Promise<T>

    // 自增ID相关方法
    updateAutoIncrement(value: number): Promise<ResultSetHeader>
} 