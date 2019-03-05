import {Router} from 'express'
import {validationResult} from 'express-validator/check'
import storedRequests, {storedRequestSearchValidation} from '../models/storedRequests'
import storedResponses, {storedResponseValidation} from '../models/storedResponses'

/** This is an API that allows you to post an expected response first, and then to have this response returned when
 * being called. */
export default () => {
    const api = Router()

    /** Display everything */
    api.get('/', storedRequestSearchValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            res.json(storedRequests.getAll(makeFilter(req.query)))
        }
    })

    /** Clear all stored requests */
    api.delete('/', storedRequestSearchValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            storedRequests.clearAll(makeFilter(req.query))
            return res.status(204).json()
        }
    })

    /** Display all stored requests for some name */
    api.get('/:name', storedRequestSearchValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            res.json(storedRequests.get(req.params.name, makeFilter(req.query)))
        }
    })

    /** Clear all stored requests for some name */
    api.delete('/:name', storedRequestSearchValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            storedRequests.clear(req.params.name, makeFilter(req.query))
            return res.status(204).json()
        }
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

            if (filter.since && time < new Date(filter.since).getTime()) {
                return false
            }
            if (filter.until && time > new Date(filter.until).getTime()) {
                return false
            }
        }

        if (filter.method && filter.method !== request.method) {
            return false
        }

        return true
    }
}