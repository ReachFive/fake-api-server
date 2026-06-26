import { check, query } from 'express-validator'

export const MAX_TWILIO_MESSAGES = parseInt(process.env.MAX_TWILIO_MESSAGES, 10) || 10000

export const twilioMessageValidation = [
    check('To').isString(),
    check('From').isString(),
    check('Body').isString()
]

export const twilioSearchValidation = [
    query('since').optional().isInt().toInt(),
    query('until').optional().isInt().toInt(),
    query('from').optional().isString(),
    query('to').optional().isString()
]

const twilioMessages = []
export default twilioMessages
