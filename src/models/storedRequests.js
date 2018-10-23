import {check, query} from "express-validator/check/index";
import {isValidISODate} from "../lib/util";


export const storedRequestSearchValidation = [
    query('since').optional().custom(isValidISODate),
    query('until').optional().custom(isValidISODate),
    query('method').optional().isString()
]

const storedRequests = {
    content: {},
    save: function(name, value) {
        const target = this.content[name] || (this.content[name] = [])
        target.unshift(value)
    },
    get: function(name, filter) {
        const forcedFilter = filter || (r => true)
        return (this.content[name] || []).filter(forcedFilter)
    },
    clear: function(name, filter) {
        const forcedFilter = filter || (r => true)
        this.content[name] = (this.content[name] || []).filter(r => !forcedFilter(r))
        if (this.content[name].size > 0) {
            delete this.content[name]
        }
    },
    getAll: function(filter) {
        const result = {}
        for (const name in this.content) {
            const array = this.get(name, filter)
            console.log("test", name, filter, array, array.length)
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
