const sendJson     = require('send-data/json')
    , validName    = require('../valid-name')
    , pkginfo      = require('../pkginfo')
    , optionParser = require('../option-parser')


module.exports      = handler
module.exports.path = '/npm/:pkg.json'


function handler (req, res, opts, callback) {
  var pkg     = opts.params.pkg
    , options = optionParser(req)

  res.setHeader('cache-control', 'no-cache')

  if (!validName(pkg))
    return callback(new Error('Invalid npm package name (' + pkg + ')'))


  if (options.downloads)
    options.downloads = 1 // months

  pkginfo(pkg, options, function (err, pkginfo) {
    if (err)
      return callback(new Error('Error fetching package info: ' + err.message))

    sendJson(req, res, pkginfo)
  })
}
