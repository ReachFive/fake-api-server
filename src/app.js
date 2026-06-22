import path from 'node:path'
import express from 'express'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import mocker from './api/mocker.js'
import twilio from './api/twilio.js'
import version from './api/version.js'
import config from './config.js'

const app = express()

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
}

app.use(compression())
app.use(cors({ exposedHeaders: config.corsHeaders }))
app.use(bodyParser.json({ limit: config.bodyLimit }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/version', version())
app.use('/mock', mocker())
app.use('/twilio', twilio())

if (config.enableUI) {
    const uiDist = path.resolve(import.meta.dirname, '..', 'ui', 'dist')
    const uiRouter = express.Router()
    uiRouter.use(express.static(uiDist))
    uiRouter.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next()
        res.sendFile(path.join(uiDist, 'index.html'))
    })
    app.use('/ui', uiRouter)
}

export default app
