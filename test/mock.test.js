import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/app'
import storedRequests from '../src/models/storedRequests'
import storedResponses from '../src/models/storedResponses'

beforeEach(() => {
    storedRequests.content = {}
    storedResponses.content = {}
})

describe('GET /mock/:name', () => {
    it('returns an empty array when no requests have been stored', async () => {
        const res = await request(app).get('/mock/anything')
        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })

    it('returns stored requests for that name only', async () => {
        await request(app).post('/mock/target/request').send({ x: 1 })
        await request(app).post('/mock/other/request').send({ y: 2 })

        const res = await request(app).get('/mock/target')
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(1)
        expect(res.body[0].body).toEqual({ x: 1 })
        expect(res.body[0].endpoint_name).toBe('target')
        expect(res.body[0].method).toBe('POST')
    })

    it('stores requests in newest-first order', async () => {
        await request(app).post('/mock/name/request').send({ n: 1 })
        await request(app).post('/mock/name/request').send({ n: 2 })

        const res = await request(app).get('/mock/name')
        expect(res.body[0].body).toEqual({ n: 2 })
        expect(res.body[1].body).toEqual({ n: 1 })
    })

    it('includes query params and headers in stored requests', async () => {
        await request(app)
            .get('/mock/name/request?foo=bar')
            .set('x-custom', 'value')

        const res = await request(app).get('/mock/name')
        expect(res.body[0].query).toEqual({ foo: 'bar' })
        expect(res.body[0].headers['x-custom']).toBe('value')
        expect(res.body[0].method).toBe('GET')
    })

    it('filters by method', async () => {
        await request(app).get('/mock/name/request')
        await request(app).post('/mock/name/request').send({})

        const res = await request(app).get('/mock/name?method=GET')
        expect(res.body).toHaveLength(1)
        expect(res.body[0].method).toBe('GET')
    })

    it('returns 422 on invalid since param', async () => {
        const res = await request(app).get('/mock/name?since=not-a-date')
        expect(res.status).toBe(422)
    })
})

describe('GET /mock (all)', () => {
    it('returns all stored requests grouped by name', async () => {
        await request(app).post('/mock/a/request').send({})
        await request(app).post('/mock/b/request').send({})

        const res = await request(app).get('/mock/')
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('a')
        expect(res.body).toHaveProperty('b')
    })

    it('returns an empty object when nothing is stored', async () => {
        const res = await request(app).get('/mock/')
        expect(res.status).toBe(200)
        expect(res.body).toEqual({})
    })
})

describe('POST /mock/:name/request', () => {
    it('returns 200 with empty body when no response is configured', async () => {
        const res = await request(app).post('/mock/name/request').send({ a: 1 })
        expect(res.status).toBe(200)
        // res.json(undefined) sends an empty body; supertest parses it as empty string
        expect(res.body).toBeFalsy()
    })

    it('accepts all HTTP methods', async () => {
        const methods = ['get', 'post', 'put', 'patch', 'delete']
        for (const method of methods) {
            const res = await request(app)[method]('/mock/name/request')
            expect(res.status).toBe(200)
        }
    })
})

describe('POST /mock/:name/response (single)', () => {
    it('configures status, payload and headers returned on next request', async () => {
        await request(app)
            .post('/mock/name/response')
            .send({ status: 201, payload: { created: true }, headers: { 'x-foo': 'bar' } })

        const res = await request(app).post('/mock/name/request').send({})
        expect(res.status).toBe(201)
        expect(res.body).toEqual({ created: true })
        expect(res.headers['x-foo']).toBe('bar')
    })

    it('returns 204 on successful response configuration', async () => {
        const res = await request(app)
            .post('/mock/name/response')
            .send({ status: 200 })
        expect(res.status).toBe(204)
    })

    it('returns 422 when status is not an integer', async () => {
        const res = await request(app)
            .post('/mock/name/response')
            .send({ status: 'bad' })
        expect(res.status).toBe(422)
    })
})

describe('POST /mock/:name/response (array — cycling)', () => {
    it('cycles through responses in order, wrapping around', async () => {
        await request(app)
            .post('/mock/name/response')
            .send([
                { status: 200, payload: 'first' },
                { status: 201, payload: 'second' },
                { status: 202, payload: 'third' },
            ])

        const r1 = await request(app).post('/mock/name/request').send({})
        const r2 = await request(app).post('/mock/name/request').send({})
        const r3 = await request(app).post('/mock/name/request').send({})
        const r4 = await request(app).post('/mock/name/request').send({})

        expect(r1.status).toBe(200)
        expect(r1.body).toBe('first')
        expect(r2.status).toBe(201)
        expect(r2.body).toBe('second')
        expect(r3.status).toBe(202)
        expect(r3.body).toBe('third')
        expect(r4.status).toBe(200) // wraps back to first
        expect(r4.body).toBe('first')
    })

    it('returns 200 empty when an empty array is posted', async () => {
        await request(app)
            .post('/mock/name/response')
            .send([])

        const res = await request(app).post('/mock/name/request').send({})
        expect(res.status).toBe(200)
    })
})

describe('DELETE /mock/:name', () => {
    it('clears stored requests for that name', async () => {
        await request(app).post('/mock/name/request').send({})
        await request(app).delete('/mock/name')

        const res = await request(app).get('/mock/name')
        expect(res.body).toEqual([])
    })

    it('returns 204', async () => {
        const res = await request(app).delete('/mock/name')
        expect(res.status).toBe(204)
    })

    it('does not affect other names', async () => {
        await request(app).post('/mock/a/request').send({})
        await request(app).post('/mock/b/request').send({})
        await request(app).delete('/mock/a')

        const res = await request(app).get('/mock/b')
        expect(res.body).toHaveLength(1)
    })
})

describe('DELETE /mock (all)', () => {
    it('clears all stored requests', async () => {
        await request(app).post('/mock/a/request').send({})
        await request(app).post('/mock/b/request').send({})
        await request(app).delete('/mock/')

        const res = await request(app).get('/mock/')
        expect(res.body).toEqual({})
    })
})
