'use strict'

const sendView = require('../send-view')


module.exports      = handler
module.exports.path = '/'


// nothing interesting in here yet
function handler (req, res, opts, callback) {
  res.setHeader('cache-control', 'no-cache')
  sendView(req, res, 'index.html', callback)
}
