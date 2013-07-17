module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/npm-dl/(.+).png'
}

const validName  = require('../valid-name')
    , pkginfo    = require('../pkginfo')
    , draw       = require('../draw-npm-downloads-badge')

function handler (pkg, callback) {
  // splink has a bug with this-binding so we'll copy references here
  // prior to async work
  var model    = this.model
    , request  = this.req
    , response = this.res
    , options  = {
          nodepends: true
        , months: Math.round(request.query.months)
      }

  response.setHeader('cache-control', 'no-cache')

  if (!validName(pkg)) {
    model.message = 'Invalid npm package name'
    return callback(null, 'error')
  }

  options.downloads = options.months > 0 && options.months < 12
      ? Number(options.months)
      : 12

  pkginfo(pkg, options, function (err, pkginfo) {
    if (err) {
      model.message = 'Error fetching package info: ' + err.message
      return callback(null, 'error')
    }
 
    response.setHeader('content-type', 'image/png')

    draw(options, pkginfo).pngStream().pipe(response)
  })
}