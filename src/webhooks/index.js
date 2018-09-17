import { Router } from 'express'
import { validationResult } from 'express-validator/check'
import webhooks, { webhookValidation, webhookSearchValidation } from '../models/webhooks'

export default ({ config, db }) => {
	const api = Router()

	api.get('/', webhookSearchValidation, (req, res) => {
		res.json(webhooks.filter(webhookFilter(req.query)))
	})

  api.post('/', webhookValidation, (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    } else {
      const payload = req.body
      webhooks.unshift(payload)
      return res.json(payload)
    }
  })

	return api
}

function webhookFilter(filter) {
  return event => {
    if (filter.since || filter.until) {
      const date = new Date(event.date).getTime()

      if (filter.since && date < filter.since) {
        return false
      }
      if (filter.until && date > filter.until) {
        return false
      }
    }

    if (filter.user_id && filter.user_id !== event.user_id) {
      return false
    }

    if (filter.type && filter.type !== event.type) {
      return false
    }

    return true
  }
}
