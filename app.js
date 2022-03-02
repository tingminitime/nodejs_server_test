const http = require('http')
const { v4: uuidv4 } = require('uuid')
const { HEADERS } = require('./config')
const { errorHandler } = require('./errors')

const port = 8080
const listenLog = `Server is running on PORT ${port} ...`
const todos = []

const requestListener = ((req, res) => {
  console.log('URL:', req.url)
  console.log('METHOD:', req.method)

  let body = ''
  req.on('data', chunk => {
    body += chunk
  })

  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, HEADERS)
    res.write(JSON.stringify({
      data: todos,
      success: true,
    }))
    res.end()
  }
  else if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title

        if (title !== undefined) {
          const todo = {
            title: title,
            id: uuidv4(),
          }
          todos.push(todo)
          console.log(todos)

          res.writeHead(200, HEADERS)
          res.write(JSON.stringify({
            data: todos,
            success: true,
          }))
          res.end()
        } else {
          errorHandler(res, '請填寫正確 title 內容!')
        }
      } catch (err) {
        errorHandler(res, '欄位未填寫正確!')
      }
    })
  }
  else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title
        const id = req.url.split('/').pop()
        const index = todos.findIndex(todo => todo.id === id)
        if (title !== undefined && index !== -1) {
          todos[index].title = title
          res.writeHead(200, HEADERS)
          res.write(JSON.stringify({
            data: todos,
            success: true,
            message: '修改成功!'
          }))
          res.end()
        } else {
          errorHandler(res, '請修改正確 id 或填寫正確 title 內容!')
        }
      } catch (err) {
        errorHandler(res, '格式錯誤!')
      }
    })
  }
  else if (req.url === '/todos' && req.method === 'DELETE') {
    todos.length = 0
    res.writeHead(200, HEADERS)
    res.write(JSON.stringify({
      data: todos,
      success: true,
      message: '已刪除全部待辦事項!'
    }))
    res.end()
  }
  else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop()
    const index = todos.findIndex(todo => todo.id === id)
    if (index !== -1) {
      const deleteTarget = todos[index]
      todos.splice(index, 1)
      res.writeHead(200, HEADERS)
      res.write(JSON.stringify({
        data: deleteTarget,
        success: true,
        message: `刪除成功 !`
      }))
    } else {
      res.writeHead(200, HEADERS)
      res.write(JSON.stringify({
        success: false,
        message: `刪除失敗，找不到此待辦事項 !`
      }))
    }
    res.end()
  }
  else if (req.url === '/todos' && req.method === 'OPTIONS') {
    res.writeHead(200, HEADERS)
    res.end()
  }
  else {
    res.writeHead(404, HEADERS)
    res.write(JSON.stringify({
      success: false,
      message: '404 not found!'
    }))
    res.end()
  }
})

const server = http.createServer(requestListener)
server.listen(port, console.log(listenLog))