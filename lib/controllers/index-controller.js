module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/'
}

// nothing interesting in here yet
function handler (context, callback) {
  context.response.setHeader('cache-control', 'no-cache')
  callback(null, 'index')
}
