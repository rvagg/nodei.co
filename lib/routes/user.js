'use strict'

const jsonist       = require('jsonist')
    , sendView      = require('../send-view')

    , pkginfoApiPfx = process.env.PKGINFO_API_PFX


module.exports      = handler
module.exports.path = '/~:user'


function handler (req, res, opts, callback) {
  let url = `${pkginfoApiPfx}/user-packages/${opts.params.user}`

  res.setHeader('cache-control', 'no-cache')

  jsonist.get(url, (err, data) => {
    if (err)
      return callback(err)

    if (!data || !Array.isArray(data) || !data.length)
      return callback(new Error(`No such user: ${opts.params.user}`))

    let ctx = {
        user     : opts.params.user
      , packages : data
    }

    res.setHeader('content-type', 'text/html')
    sendView(req, res, 'user.html', ctx, callback)
  })
}
