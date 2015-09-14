'use strict'

const validName = require('../valid-name')
    , pkgregex  = validName.pkgregex


module.exports      = handler
module.exports.path = `/npm(?:-dl)?/:pkg(${pkgregex})/?`


function handler (req, res, opts, callback) {
  var pkg = opts.params.pkg.replace(/\/$/, '')

  if (!validName(pkg))
    return callback(new Error(`Invalid npm package name (${pkg})`))

  res.writeHead(303, {
    'location': `https://npmjs.org/package/${pkg}`
  })
  res.end()
}
