import { param, query } from 'express-validator'
import { isValidISODate } from '../lib/util.js'

const MAX_REQUESTS_PER_NAME = parseInt(process.env.MAX_REQUESTS_PER_NAME, 10) || 1000
const MAX_ENDPOINT_NAMES = parseInt(process.env.MAX_ENDPOINT_NAMES, 10) || 500

export const nameValidation = [
    param('name').matches(/^[\w-]{1,100}$/).withMessage('Invalid name')
]

export const storedRequestSearchValidation = [
    query('since').optional().custom(isValidISODate),
    query('until').optional().custom(isValidISODate),
    query('method').optional().isString()
]

const storedRequests = {
    content: Object.create(null),
    save: function(name, value) {
        const isNew = !this.content[name]
        if (isNew && Object.keys(this.content).length >= MAX_ENDPOINT_NAMES) {
            return
        }
        const target = this.content[name] || (this.content[name] = [])
        target.unshift(value)
        if (target.length > MAX_REQUESTS_PER_NAME) {
            target.length = MAX_REQUESTS_PER_NAME
        }
    },
    get: function(name, filter) {
        const forcedFilter = filter || (() => true)
        return (this.content[name] || []).filter(forcedFilter)
    },
    clear: function(name, filter) {
        const forcedFilter = filter || (() => true)
        this.content[name] = (this.content[name] || []).filter(r => !forcedFilter(r))
        if (this.content[name].length === 0) {
            delete this.content[name]
        }
    },
    getAll: function(filter) {
        const result = {}
        for (const name in this.content) {
            const array = this.get(name, filter)
            if (array.length > 0) {
                result[name] = array
            }
        }
        return result
    },
    clearAll: function(filter) {
        for (const name in this.content) {
            this.clear(name, filter)
        }
    }
}

export default storedRequests
