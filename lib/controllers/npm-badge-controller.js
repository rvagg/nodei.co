module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/npm/(.+).png'
}

const validName  = require('../valid-name')
    , pkginfo    = require('../pkginfo')
    , draw       = require('../draw-npm-badge')

    , optionKeys = 'stars downloads compact mini'.split(' ')

function optionOn (request, option) {
  var o = request.query[option]
  if (o === '')
    return true
  if (!o)
    return false
  o = o.toLowerCase()
  return o != '0' && o != 'false' && o != 'no'
}

function handler (pkg, callback) {
  // splink has a bug with this-binding so we'll copy references here
  // prior to async work
  var model    = this.model
    , request  = this.req
    , response = this.res
    , options  = { }

  response.setHeader('cache-control', 'no-cache')

  if (!validName(pkg)) {
    model.message = 'Invalid npm package name'
    return callback(null, 'error')
  }

  optionKeys.forEach(function (o) {
    options[o] = optionOn(request, o)
  })

  if (options.downloads)
    options.downloads = 1 // months

  pkginfo(pkg, options, function (err, pkginfo) {
    if (err) {
      model.message = 'Error fetching package info: ' + err.message
      return callback(null, 'error')
    }
 
    response.setHeader('content-type', 'image/png')

    draw(options, pkginfo).pngStream().pipe(response)
  })
}