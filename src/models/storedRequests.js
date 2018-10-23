import {query} from "express-validator/check/index";


export const storedRequestSearchValidation = [
    query('since').optional().isInt(),
    query('until').optional().isInt(),
    query('method').optional().isString()
]

const storedRequests = {
    content: {},
    save: function(name, value) {
        const target = this.content[name] || (this.content[name] = [])
        target.unshift(value)
    },
    get: function(name) {
        return this.content[name] || []
    },
    all: function() {
        const res = []
        for (const name in this.content) {
            res.push(...this.content[name])
        }
        return res
    }
}

export default storedRequests
