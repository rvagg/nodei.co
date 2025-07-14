import fs from 'fs'
import bole from 'bole'
import createServer from './nodeico-fastify.js'

// Setup logging
const isDev = (/^dev/i).test(process.env.NODE_ENV)

bole.output({
  level: isDev ? 'debug' : 'info',
  stream: process.stdout
})

if (process.env.LOG_FILE) {
  console.log(`Starting logging to ${process.env.LOG_FILE}`)
  bole.output({
    level: 'debug',
    stream: fs.createWriteStream(process.env.LOG_FILE)
  })
}

const log = bole('server')
const port = process.env.PORT || 3000

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createServer()

  server.listen({ port }, (err) => {
    if (err) {
      log.error(err)
      throw err
    }

    log.info(`Server started on port ${port}`)
    console.log()
    console.log(`>> Running: http://localhost:${port}`)
    console.log()
  })
}
