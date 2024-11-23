import { createConnection } from 'mysql2'

import { config } from 'dotenv'
config()

const connection = createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT
}).promise()

async function getTodos() {
    const [rows] = await connection.query("SELECT * FROM todos")
    return rows
}

const todos = await getTodos()
console.log(todos)