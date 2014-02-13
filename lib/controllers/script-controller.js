module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/js/script.js'
}

const path       = require('path')
    , browserify = require('browserify')

const index = path.join(__dirname, '../../browser-lib/index.js')

function handler (context, callback) {
  context.setContentType('text/javascript')
  browserify(index).bundle().pipe(context.response)
  // don't touch callback, we'll handle the response thanks!
}
