// No, this isn't using Restify, it's only using some restify plugins.
// It uses SplinkSMVC which as yet doesn't have any documentation,
// https://github.com/rvagg/splink-smvc so you'll have to make do by reading
// the source here and trying to understand what's going on.
// SplinkSMVC is built on Splink an IoC/DI container that does have a little
// bit of documentation (even if some of it is outdated)
// https://github.com/rvagg/splink

// Swig for templating, st for static file serving, Director for routing
// Restify plugins for some basic http tasks like query processing and
// body parsing

// Start here, then look in lib/controllers/ and lib/filters/ and go from there

const path        = require('path')
    , fs          = require('fs')
    , splinksmvc  = require('splink-smvc')
    , redirector  = require('./lib/redirector')
    , isDev       = (/^dev/i).test(process.env.NODE_ENV)

    , defaultHost = 'nodei.co'
    , port        = process.env.PORT || 3000
    , sslKeyFile  = path.join(__dirname, 'keys/nodeico.key')
    , sslCertFile = path.join(__dirname, 'keys/nodei.co.crt')

var ssl

// does messy prototype extension, need to load it before we load restify
// plugins in our filters
require('restify-request')

// init swig with 'root' param, this isn't done by `consolidate` but required by
// swig if you want to reference templates from within templates
require('swig').init({ root: path.join(__dirname, 'views'), cache: !isDev })

if (fs.existsSync(sslKeyFile) && fs.existsSync(sslCertFile)) {
  ssl = {
      key  : fs.readFileSync(sslKeyFile)
    , cert : fs.readFileSync(sslCertFile)
  }
} // else won't start with https, will just start an http

splinksmvc({
    port     : port
  , ssl      : ssl
    // directories to scan for auto-loaded components
  , scan     : [
        path.join(__dirname, './lib/controllers/')
      , path.join(__dirname, './lib/filters/')
    ]
    // passed on to `st` (npm.im/st)
  , 'static' : {
        path       : path.join(__dirname, './public')
      , url        : '/'
      , cache      : isDev ? false : {}
    }
    // view components, resolved from controllers returning string with
    // their names which map to <name>.<suffix> and are processed by the
    // default processor listed here (although that can be changed on a per-
    //  controller basis)
  , 'views'  : {
        path       : path.join(__dirname, './views')
      , suffix     : 'html'
      , processor  : 'swig'
    }
}).start()

if (process.env.REDIRECT_PORT) {
  console.log('Starting redirector on port', process.env.REDIRECT_PORT)
  redirector(defaultHost, process.env.REDIRECT_PORT, port)
} else
  console.log('Not starting redirector, $REDIRECT_PORT')