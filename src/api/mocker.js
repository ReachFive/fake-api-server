import {Router} from 'express'
import { validationResult, matchedData } from 'express-validator'
import storedRequests, {nameValidation, storedRequestSearchValidation} from '../models/storedRequests.js'
import storedResponses, {storedResponseValidation} from '../models/storedResponses.js'

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
            res.json(storedRequests.getAll(makeFilter(matchedData(req))))
        }
    })

    /** Clear all stored requests */
    api.delete('/', storedRequestSearchValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            storedRequests.clearAll(makeFilter(matchedData(req)))
            return res.status(204).json()
        }
    })

    /** Display all stored requests for some name */
    api.get('/:name', nameValidation, storedRequestSearchValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            res.json(storedRequests.get(req.params.name, makeFilter(matchedData(req))))
        }
    })

    /** Clear all stored requests for some name */
    api.delete('/:name', nameValidation, storedRequestSearchValidation, (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            storedRequests.clear(req.params.name, makeFilter(matchedData(req)))
            return res.status(204).json()
        }
    })

    /** Prepare a response */
    api.post('/:name/response', nameValidation, storedResponseValidation, (req, res) => {
        const name = req.params.name
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        } else {
            if (Array.isArray(req.body)) storedResponses.saveMultiple(name, req.body)
            else storedResponses.save(name, req.body || {})
            return res.status(204).json()
        }
    })

    /** Receive a GET request and return the prepared response */
    api.get('/:name/request', nameValidation, (req, res) => handleRequest("GET", req, res))

    /** Receive a POST request and return the prepared response */
    api.post('/:name/request', nameValidation, (req, res) => handleRequest("POST", req, res))

    /** Receive a PUT request and return the prepared response */
    api.put('/:name/request', nameValidation, (req, res) => handleRequest("PUT", req, res))

    /** Receive a PATCH request and return the prepared response */
    api.patch('/:name/request', nameValidation, (req, res) => handleRequest("PATCH", req, res))

    /** Receive a DELETE request and return the prepared response */
    api.delete('/:name/request', nameValidation, (req, res) => handleRequest("DELETE", req, res))

    function handleRequest(method, req, res) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }
        const name = req.params.name
        const storedRequest = {
            query: req.query,
            body: req.body,
            headers: obfuscateHeaders(req.headers),
            server_date: new Date(),
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

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'x-api-key', 'x-auth-token'])
const SCHEME_PREFIX_RE = /^(Bearer|Basic|Token|Digest)\s+/i

function obfuscateHeaders(headers) {
    const result = {}
    for (const [key, value] of Object.entries(headers)) {
        if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
            const match = SCHEME_PREFIX_RE.exec(value)
            result[key] = match ? `${match[0]}[redacted]` : '[redacted]'
        } else {
            result[key] = value
        }
    }
    return result
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
