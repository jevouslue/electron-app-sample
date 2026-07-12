import { expect, test } from 'vitest'
import { parseToCRUD } from '/src/sql-parser'
import fs from "fs";

test('SELECTを用いたINSERT', () => {
    const sql = fs.readFileSync('tests/sql-parser/sql/insert_select.sql','utf-8')
    expect(parseToCRUD(sql)).toStrictEqual([
        {table: 'users', database: null, crud: 'R'},
        {table: 'archive_users', database: null, crud: 'C'},
    ])
})
