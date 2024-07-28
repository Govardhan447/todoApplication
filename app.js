const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbpath = path.join(__dirname, 'todoApplication.db')

let db = null

const initilizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Runnning on http://localhost/3000/')
    })
  } catch (e) {
    console.log(`DB error:${e.meassage}`)
    process.exit(1)
  }
}

initilizeDBAndServer()

const hasPriorityAndStatusProperities = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
app.get('/todos/', async (request, response) => {
  let {search_q = '', priority, status} = request.query

  let getToDoQuery = ''
  switch (true) {
    case hasPriorityAndStatusProperities(request.query):
      getToDoQuery = `
         SELECT
          *
          FROM
            todo
          WHERE
          todo LIKE '%${search_q}%' 
          AND status = '${status}'
          AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getToDoQuery = `
         SELECT
          *
          FROM
            todo
          WHERE
          todo LIKE '%${search_q}%' 
          AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getToDoQuery = `
         SELECT
          *
          FROM
            todo
          WHERE
          todo LIKE '%${search_q}%' 
          AND status = '${status}';`
      break
    default:
      getToDoQuery = `
          SELECT
            *
          FROM
            todo 
          WHERE
            todo LIKE '%${search_q}%';`
  }
  const dbResponse = await db.all(getToDoQuery)
  response.send(dbResponse)
})

//GET API 2 todo table
app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const getToDoQuery = `
          SELECT
            *
          FROM
            todo
          WHERE 
            id =${todoId};`
  const dbResponse = await db.all(getToDoQuery)
  response.send(dbResponse[0])
})

//POST API 3 Create New todo
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const getToDoQuery = `
          INSERT INTO
              todo (id, todo, priority, status)
          VALUES
              (${id}, 
              '${todo}',
              '${priority}', 
              '${status}');`
  const dbResponse = await db.run(getToDoQuery)
  response.send('Todo Successfully Added')
})

// PUT API 4 Update todo
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  const {status, priority, todo} = requestBody
  let updatedQuery = ''

  let data = null
  switch (true) {
    case requestBody.status !== undefined:
      updatedQuery = 'Status'
      break
    case requestBody.priority !== undefined:
      updatedQuery = 'Priority'
      break
    case requestBody.todo !== undefined:
      updatedQuery = 'Todo'
      break
  }

  const getToDoQuery = `
          UPDATE
            todo
          SET
            todo = '${todo}',
            priority = '${priority}',
            status = '${status}'
          WHERE
            id = ${todoId};`
  data = await db.run(getToDoQuery)

  response.send(`${updatedQuery} Updated`)
})

//DELETE todo table API 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getToDoQuery = `
          DELETE FROM
            todo
          WHERE
            id = ${todoId};`
  const dbResponse = await db.run(getToDoQuery)
  response.send('Todo Deleted')
})

module.exports = app
