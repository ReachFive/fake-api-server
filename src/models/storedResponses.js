import { check } from 'express-validator'

const MAX_ENDPOINT_NAMES = parseInt(process.env.MAX_ENDPOINT_NAMES, 10) || 500

export const storedResponseValidation = [
    check('status').optional().isInt({ min: 200, max: 599 }),
    check('payload').optional(),
    check('headers').optional().isObject().custom((headers) => {
        for (const [key, val] of Object.entries(headers)) {
            if (typeof key !== 'string' || typeof val !== 'string') {
                throw new Error('All header keys and values must be strings')
            }
        }
        return true
    })
]

const storedResponses = {
    content: Object.create(null),
    save: function(name, value) {
        if (!this.content[name] && Object.keys(this.content).length >= MAX_ENDPOINT_NAMES) {
            return
        }
        this.content[name] = {
            responses: [value],
            index: -1
        }
    },
    saveMultiple: function(name, values) {
        if (!this.content[name] && Object.keys(this.content).length >= MAX_ENDPOINT_NAMES) {
            return
        }
        this.content[name] = {
            responses: values,
            index: -1
        }
    },
    get: function(name) {
        const target = this.content[name]
        if (target && target.responses.length > 0) {
            target.index = (target.index + 1) % target.responses.length
            return target.responses[target.index] || {}
        } else {
            return {}
        }
    }
}

export default storedResponses
