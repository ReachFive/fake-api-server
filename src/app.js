import express from 'express'
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

app.use(cors({ origin: config.corsOrigin, exposedHeaders: config.corsHeaders }))
app.use(bodyParser.json({ limit: config.bodyLimit, inflate: false }))
app.use(bodyParser.urlencoded({ extended: false, limit: config.bodyLimit, inflate: false }))

app.use('/version', version())
app.use('/mock', mocker())
app.use('/twilio', twilio())

export default app
