import {Router} from 'express'

/** This is an API displaying the version of the fake-api-server */
export default () => {
    const api = Router()

    /** Display everything */
    api.get('/', (req, res) => {
        return res.status(200).json({
            timestamp: "2018-11-12T16:45:00+01:00" //last update
        })
    })

    return api
}