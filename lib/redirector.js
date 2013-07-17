const http = require('http')

function redirector (host, port, redirectPort) {
  http.createServer(function (req, res) {
    res.writeHead(303, {
      'location': 'https://' + host + ':' + redirectPort + req.url
    })
    res.end()
  }).listen(port)
}

module.exports = redirector