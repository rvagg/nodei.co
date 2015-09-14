'use strict'

const path     = require('path')
    , swig     = require('swig')
    , sendHtml = require('send-data/html')


function sendView (req, res, name, ctx, callback) {
  if (typeof ctx == 'function') {
    callback = ctx
    ctx = {}
  }

  swig.renderFile(path.join(__dirname, '../views', name), ctx, (err, html) => {
    if (err)
      return callback(err)

    sendHtml(req, res, html)
  })
}

module.exports = sendView
