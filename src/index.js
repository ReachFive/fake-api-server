import http from 'http'
import app from './app'
import config from './config.json'

const server = http.createServer(app)
server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${server.address().port}`) // eslint-disable-line no-console
})
