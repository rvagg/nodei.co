const db      = require('../db')
    , enabled = process.env.NODEICOLOG

if (enabled) {
  module.exports = logFilter
  module.exports.$config = {
      id       : '04-log-filter'
    , category : 'filter'
    , style    : 'connect'
  }
}

function logFilter (req, res, next) {
  db.log({
      time       : new Date()
    , remoteHost : req.socket.remoteAddress
    , url        : req.url
    , method     : req.method
    , headers    : req.headers
    , userAgent  : req.headers['user-agent']
  }, function (err) {
    if (err)
      console.error(err)
  })

  next()
}
