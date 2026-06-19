import { Router } from 'express'
import { version } from '../../package.json'

/** This is an API displaying the version of the fake-api-server */
export default () => {
    const api = Router()

    api.get('/', (_req, res) => {
        return res.status(200).json({ version })
    })

    return api
}
