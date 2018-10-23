import {Router} from 'express'
import {validationResult} from 'express-validator/check'
import storedRequests, {storedRequestSearchValidation} from '../models/storedRequests'
import storedResponses, {storedResponseValidation} from '../models/storedResponses'

/** This is an API that allows you to post an expected response first, and then to have this response returned when
 * being called. */
export default ({config, db}) => {
    const api = Router()

    /** Display everything */
    api.get('/', storedRequestSearchValidation, (req, res) => {
        const content = storedRequests.content
        const result = {}
        for(const name in content) {
            const filteredArray = content[name].filter(makeFilter(req.query))
            if (!filteredArray.isEmpty) {
                result[name] = filteredArray
            }
        }
        res.json(result)
    })

    /** Display all stored requests for some name */
    api.get('/:name', storedRequestSearchValidation, (req, res) => {
        res.json(storedRequests.get(req.params.name).filter(makeFilter(req.query)))
    })

    /** Prepare a response */
    api.post('/:name/response', storedResponseValidation, (req, res) => {
        const name = req.params.name
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            if (req.body.constructor === Array) storedResponses.saveMultiple(name, req.body)
            else storedResponses.save(name, req.body)
            return res.status(204).json()
        }
    })

    /** Receive a GET request and return the prepared response */
    api.get('/:name/request', (req, res) => handleRequest("GET", req, res))

    /** Receive a POST request and return the prepared response */
    api.post('/:name/request', (req, res) => handleRequest("POST", req, res))

    /** Receive a POST request and return the prepared response */
    api.put('/:name/request', (req, res) => handleRequest("PUT", req, res))

    /** Receive a POST request and return the prepared response */
    api.patch('/:name/request', (req, res) => handleRequest("PATCH", req, res))

    /** Receive a POST request and return the prepared response */
    api.delete('/:name/request', (req, res) => handleRequest("DELETE", req, res))

    function handleRequest(method, req, res) {
        const name = req.params.name
        const storedRequest = {
            query: req.query,
            body: req.body,
            headers: req.headers,
            server_date: new Date,
            endpoint_name: name,
            method: method
        }
        storedRequests.save(name, storedRequest)
        const storedResponse = storedResponses.get(name)
        const status = storedResponse.status || 200
        const headers = storedResponse.headers || {}
        const payload = storedResponse.payload || undefined
        return res.status(status).header(headers).json(payload)
    }

    return api
}

function makeFilter(filter) {
    return request => {
        if (filter.since || filter.until) {
            const time = request.server_date.getTime()

            if (filter.since && time < filter.since) {
                return false
            }
            if (filter.until && time > filter.until) {
                return false
            }
        }

        if (filter.method && filter.method !== request.method) {
            return false
        }

        return true
    }
}