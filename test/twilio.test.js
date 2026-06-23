import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/app'
import twilioMessages, { MAX_TWILIO_MESSAGES } from '../src/models/twilioMessages'

beforeEach(() => {
    twilioMessages.splice(0)
})

describe('POST /twilio/messages', () => {
    it('stores a message and returns it with metadata', async () => {
        const res = await request(app)
            .post('/twilio/messages')
            .send({ To: '+33606060606', From: '+33101010101', Body: 'code 1234' })

        expect(res.status).toBe(200)
        expect(res.body.to).toBe('+33606060606')
        expect(res.body.from).toBe('+33101010101')
        expect(res.body.body).toBe('code 1234')
        expect(res.body.sid).toBeDefined()
        expect(res.body.date_created).toBeDefined()
    })

    it('returns 422 when required fields are missing', async () => {
        const res = await request(app)
            .post('/twilio/messages')
            .send({ To: '+33606060606' }) // missing From and Body
        expect(res.status).toBe(422)
    })

    it('assigns incrementing sids', async () => {
        const r1 = await request(app).post('/twilio/messages').send({ To: '+1', From: '+2', Body: 'a' })
        const r2 = await request(app).post('/twilio/messages').send({ To: '+1', From: '+2', Body: 'b' })
        expect(Number(r2.body.sid)).toBeGreaterThan(Number(r1.body.sid))
    })
})

describe('GET /twilio/messages', () => {
    it('returns an empty array when no messages have been sent', async () => {
        const res = await request(app).get('/twilio/messages')
        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })

    it('returns messages in newest-first order', async () => {
        await request(app).post('/twilio/messages').send({ To: '+1', From: '+2', Body: 'first' })
        await request(app).post('/twilio/messages').send({ To: '+1', From: '+2', Body: 'second' })

        const res = await request(app).get('/twilio/messages')
        expect(res.body[0].body).toBe('second')
        expect(res.body[1].body).toBe('first')
    })

    it('filters by to', async () => {
        await request(app).post('/twilio/messages').send({ To: '+33600000001', From: '+1', Body: 'a' })
        await request(app).post('/twilio/messages').send({ To: '+33600000002', From: '+1', Body: 'b' })

        const res = await request(app).get('/twilio/messages?to=%2B33600000001')
        expect(res.body).toHaveLength(1)
        expect(res.body[0].to).toBe('+33600000001')
    })

    it('filters by from', async () => {
        await request(app).post('/twilio/messages').send({ To: '+1', From: '+33600000001', Body: 'a' })
        await request(app).post('/twilio/messages').send({ To: '+1', From: '+33600000002', Body: 'b' })

        const res = await request(app).get('/twilio/messages?from=%2B33600000002')
        expect(res.body).toHaveLength(1)
        expect(res.body[0].from).toBe('+33600000002')
    })
})

describe('GET /version', () => {
    it('returns a version response', async () => {
        const res = await request(app).get('/version')
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
    })
})

describe('security: twilio memory cap', () => {
    it('caps stored messages at MAX_TWILIO_MESSAGES after posting', async () => {
        for (let i = 0; i < MAX_TWILIO_MESSAGES; i++) {
            twilioMessages.push({ to: '+1', from: '+2', body: `msg${i}`, sid: String(i), date_created: new Date().toISOString() })
        }
        await request(app).post('/twilio/messages').send({ To: '+1', From: '+2', Body: 'overflow' })
        expect(twilioMessages.length).toBe(MAX_TWILIO_MESSAGES)
    })
})
