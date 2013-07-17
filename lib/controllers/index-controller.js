module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/'
}

// nothing interesting in here yet
function handler () {
  this.res.setHeader('cache-control', 'no-cache')
  return 'index'
}