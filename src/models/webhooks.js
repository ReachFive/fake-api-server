import {query} from 'express-validator/check'

/** No validation on webhooks, accept anything */
export const webhookValidation = [
    //nothing to validate, it may miss any field
]

export const webhookSearchValidation = [
    query('since').optional().isInt(),
    query('until').optional().isInt(),
    query('user_id').optional().isString(),
    query('type').optional().isString()
]

const webhooks = []
export default webhooks
