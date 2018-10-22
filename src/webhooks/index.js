import {Router} from 'express'
import {validationResult} from 'express-validator/check'
import webhooks, {webhookValidation, webhookSearchValidation} from '../models/webhooks'

export default ({config, db}) => {
    const api = Router()

    /** List of webhook calls */
    api.get('/', webhookSearchValidation, (req, res) => {
        res.json(webhooks.filter(webhookFilter(req.query)))
    })

    /** Add a new webhook call */
    api.post('/', webhookValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            const payload = req.body
            payload.server_date = new Date
            webhooks.unshift(payload)
            return res.json(payload)
        }
    })

    return api
}

function webhookFilter(filter) {
    return event => {
        if (filter.since || filter.until) {
            const time = event.server_date.getTime()

            if (filter.since && time < filter.since) {
                return false
            }
            if (filter.until && time > filter.until) {
                return false
            }
        }

        /* User id may be on the user object or directly at the root */
        if (filter.user_id && filter.user_id !== event.user_id && filter.user_id !== event.user.id) {
            return false
        }

        if (filter.type && filter.type !== event.type) {
            return false
        }

        return true
    }
}
