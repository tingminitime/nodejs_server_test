const { headers } = require('./headers')

module.exports = {
  errorHandler(res, message) {
    res.writeHead(400, headers)
    res.write(JSON.stringify({
      status: false,
      message
    }))
    res.end()
  },
}