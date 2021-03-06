'use strict'

const optionParser = require('../option-parser')
    , validName    = require('../valid-name')
    , draw         = require('../draw-npm-badge')
    , pkginfo      = require('../pkginfo')
    , sendView     = require('../send-view')
    , pkgregex     = validName.pkgregex


module.exports      = handler
module.exports.path = [ `/npm/:pkg(${pkgregex}).png`, `/npm/:pkg(${pkgregex}).svg` ]


function handler (req, res, opts, callback) {
  let pkg     = opts.params.pkg
    , options = optionParser(req)

  if (!validName(pkg))
    return callback(new Error(`Invalid npm package name (${pkg})`))

  if (options.downloads) {
    options.downloads = 1 // months
    options.downloadSum = true
  }

  pkginfo(req.log, pkg, options, (err, pkginfo) => {
    if (err)
      return callback(new Error(`Error fetching package info: ${err.message}`))

    let ctx = {}

    res.setHeader('cache-control', 'no-cache')

    if (/\.svg$/.test(req.url)) { // svg

      ctx.options = options
      ctx.pkginfo = pkginfo
      ctx.params  = draw.calculateParams(options, pkginfo)
      res.setHeader('content-type', 'image/svg+xml')
      sendView(req, res, 'npm-badge.svg', ctx, callback)

    } else { // png

      res.setHeader('content-type', 'image/png')
      draw(options, pkginfo).pngStream().pipe(res)

    }
  })
}
