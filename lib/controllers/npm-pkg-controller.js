module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/npm/(.+)/'
}

const validName = require('../valid-name')

function handler (pkg, callback) {
  pkg = pkg.replace(/\/$/, '')
  if (!validName(pkg)) {
    this.model.message = 'Invalid npm package name (' + pkg + ')'
    return callback(null, 'error')
  }

  this.res.writeHead(303, {
    'location': 'https://npmjs.org/package/' + pkg
  })
  this.res.end()
}