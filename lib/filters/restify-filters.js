//, filterPrePause   = require('restify-plugin-pre-pause')
module.exports.filterPrePath             = require('restify-plugin-pre-path')()
module.exports.filterPrePath.$config     = { category: 'filter', id: '01-pre-path' }
module.exports.filterGzip                = require('restify-plugin-gzip')()
module.exports.filterGzip.$config        = { category: 'filter', id: '02-gzip' }
module.exports.filterQuery               = require('restify-plugin-query')()
module.exports.filterQuery.$config       = { category: 'filter', id: '03-query' }