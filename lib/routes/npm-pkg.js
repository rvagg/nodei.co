var validName = require('../valid-name')


module.exports      = handler
module.exports.path = '/npm(?:-dl)?/:pkg/?'


function handler (req, res, opts, callback) {
  var pkg = opts.params.pkg.replace(/\/$/, '')

  if (!validName(pkg))
    return callback(new Error('Invalid npm package name (' + pkg + ')'))

  res.writeHead(303, {
    'location': 'https://npmjs.org/package/' + pkg
  })
  res.end()
}
