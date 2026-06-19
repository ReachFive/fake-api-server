import http from 'http'
import app from './app.js'
import config from './config.js'

const server = http.createServer(app)
server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${server.address().port}`) // eslint-disable-line no-console
})
