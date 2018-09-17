import { check, query } from 'express-validator/check'
import { checkOptional, checkISODate } from '../lib/util'

export const webhookValidation = [
  check('user_id').isString(),
  check('type').isString(),
  checkOptional('auth_type').isString(),
  check('client_id').isString(),
  checkOptional('device').isString(),
  checkISODate('date')
]

export const webhookSearchValidation = [
  query('since').optional().isInt(),
  query('until').optional().isInt(),
  query('user_id').optional().isString(),
  query('type').optional().isString()
]

const webhooks = []
export default webhooks
