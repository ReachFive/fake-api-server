import {check} from "express-validator/check/index";


export const storedResponseValidation = [
    check('status').optional().isInt(),
    check('payload'),
    check('headers').optional()
]

const storedResponses = {
    content: {},
    save: function(name, value) {
        this.content[name] = {
            responses: [value],
            index: -1
        }
    },
    saveMultiple: function (name, values) {
        this.content[name] = {
            responses: values,
            index: -1
        }
    },
    get: function(name) {
        const target = this.content[name]
        if (target) {
            target.index = (target.index + 1) % target.responses.length
            return target.responses[target.index] || {}
        } else {
            return {}
        }
    },


}

export default storedResponses
