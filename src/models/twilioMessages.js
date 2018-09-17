import { check, query } from 'express-validator/check'

export const twilioMessageValidation = [
  check('To').isString(),
  check('From').isString(),
  check('Body').isString()
]

export const twilioSearchValidation = [
  query('since').optional().isInt(),
  query('until').optional().isInt(),
  query('from').optional().isString(),
  query('to').optional().isString()
]

const twilioMessages = []
export default twilioMessages
