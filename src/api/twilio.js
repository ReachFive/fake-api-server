import { Router } from 'express'
import { validationResult, matchedData } from 'express-validator'
import twilioMessages, { twilioMessageValidation, twilioSearchValidation } from '../models/twilioMessages.js'

export default () => {
    let fakeId = 0
    const api = Router()

    api.get('/messages', twilioSearchValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }
        res.json(twilioMessages.filter(messageFilter(matchedData(req))))
    })

    api.post('/messages', twilioMessageValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }
        const { To, From, Body } = req.body
        const result = {
            sid: (++fakeId).toString(),
            to: To,
            from: From,
            body: Body,
            date_created: new Date().toISOString()
        }
        twilioMessages.unshift(result)
        return res.json(result)
    })

    return api
}

function messageFilter(filter) {
    return message => {
        if (filter.since || filter.until) {
            const date = new Date(message.date_created).getTime()

            if (filter.since && date < filter.since) {
                return false
            }
            if (filter.until && date > filter.until) {
                return false
            }
        }

        if (filter.to && filter.to !== message.to) {
            return false
        }

        if (filter.from && filter.from !== message.from) {
            return false
        }

        return true
    }
}
