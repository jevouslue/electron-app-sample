import { Parser } from 'node-sql-parser'

export function parseToCRUD(sql: string) {
    const crudMap: Record<string, string> = {
        insert: 'C',
        select: 'R',
        update: 'U',
        delete: 'D',
    }

    // CRUD図用のデータ構造に変換
    return new Parser()
        .tableList(sql, {database: 'MySQL'})
        .map(item => {
            let [action, database, table] = item.split('::')
            database = database==='null' ? null : database

            // 操作名をCRUDの文字にマッピング
            let crud = crudMap?.[action] || 'UNKNOWN'
            return {table, database, crud}
        })
}
