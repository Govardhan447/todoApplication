const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'transactions.db')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

let db = null

const initilizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(process.env.PROT || 3000, () => {
      console.log('Server Runnning on http://localhost/3000/')
    })
  } catch (e) {
    console.log(`DB error:${e.meassage}`)
    process.exit(1)
  }
}

initilizeDBAndServer()

//GET API 2 todo table
app.get('/todos/', async (request, response) => {
  const {month} = request.params
  const getToDoQuery = `
          SELECT
          
          id, date, description, amount, transactionType
          
          FROM
            transactions
          
          ;`
  const dbResponse = await db.all(getToDoQuery)
  response.send(dbResponse)
})

//POST API 3 Create New todo
app.post('/todos/', async (request, response) => {
  const {id, date, description, credit, debit, balance} = request.body

  const getToDoQuery = `
          INSERT INTO
              transactions (id, date, description, credit, debit, balance)
          VALUES
              ('${id}',
              '${date}', 
              '${description}',
              ${credit}, 
              ${debit},
              ${balance}
              );`
  const dbResponse = await db.run(getToDoQuery)
  const newData = dbResponse.lastID
  response.send(dbResponse)
})

// PUT API 4 Update todo
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  const {description, amount, transactionType} = requestBody

  const getToDoQuery = `
          UPDATE
            transactions
          SET
            description = '${description}',
            amount = ${amount},
            transactionType = '${transactionType}'
          WHERE
            id = ${todoId};`
  data = await db.run(getToDoQuery)

  response.send(data)
})

//DELETE todo table API 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getToDoQuery = `
          DELETE FROM
            transactions
          WHERE
            id = ${todoId};`
  const dbResponse = await db.run(getToDoQuery)
  response.send('Todo Deleted')
})

module.exports = app
