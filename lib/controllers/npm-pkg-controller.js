module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/npm/:pkg/'
}

const validName = require('../valid-name')

function handler (context, callback) {
  var pkg = context.params.pkg.replace(/\/$/, '')
  if (!validName(pkg)) {
    context.model.message = 'Invalid npm package name (' + pkg + ')'
    return callback(null, 'error')
  }

  context.response.writeHead(303, {
    'location': 'https://npmjs.org/package/' + pkg
  })
  context.response.end()
}