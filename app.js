const http = require('http')
const { v4: uuidv4 } = require('uuid')
const { headers } = require('./headers')
const { errorHandler } = require('./errors')

const port = 8080
const listenLog = `Server is running on PORT ${port}`
const todos = []

const requestListener = ((req, res) => {
  console.log('URL:', req.url)
  console.log('METHOD:', req.method)

  let body = ''
  req.on('data', chunk => {
    body += chunk
  })

  switch (req.url) {
    case '/todos':
      if (req.method === 'GET') {
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          data: todos,
          success: true,
        }))
        res.end()
      }
      else if (req.method === 'POST') {
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

              res.writeHead(200, headers)
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
      else if (req.method === 'DELETE') {
        todos.length = 0
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          data: todos,
          success: true,
          message: '刪除成功'
        }))
        res.end()
      }
      else if (req.method === 'OPTIONS') {
        res.writeHead(200, headers)
        res.end()
      }
      break
    case '/todos/':
      break
    default:
      res.writeHead(404, headers)
      res.write(JSON.stringify({
        success: false,
        message: '404 not found!'
      }))
      res.end()
      break
  }
})

const server = http.createServer(requestListener)
server.listen(port, console.log(listenLog))