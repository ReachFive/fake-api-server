import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import initializeDb from './db'
import middleware from './middleware'
import mocker from './api/mocker'
import twilio from './api/twilio'
import version from './api/version'
import config from './config.json'

const app = express()

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
}

app.use(cors({ exposedHeaders: config.corsHeaders }))
app.use(bodyParser.json({ limit: config.bodyLimit }))
app.use(bodyParser.urlencoded({ extended: true }))

initializeDb(db => {
    app.use(middleware({ config, db }))
    app.use('/version', version({ config, db }))
    app.use('/mock', mocker({ config, db }))
    app.use('/twilio', twilio({ config, db }))
})

export default app
