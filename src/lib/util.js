import { check } from 'express-validator/check'

/**	Creates a callback that proxies node callback style arguments to an Express Response object.
 *	@param {express.Response} res	Express HTTP Response
 *	@param {number} [status=200]	Status code to send on success
 *
 *	@example
 *		list(req, res) {
 *			collection.find({}, toRes(res))
 *		}
 */
export function toRes(res, status=200) {
	return (err, thing) => {
		if (err) return res.status(500).send(err)

		if (thing && typeof thing.toObject==='function') {
			thing = thing.toObject()
		}
		res.status(status).json(thing)
	}
}

export function isValidISODate(value) {
  const date = new Date(value)
  if (!date.getTime()) return false
  return date.toISOString() === value
}

export function checkISODate(field) {
	return check(field, 'Invalid ISO date').custom(isValidISODate)
}

export function checkOptional(field) {
	return check(field).optional({ nullable: true })
}
