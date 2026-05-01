import { describe, it, expect, beforeAll } from 'vitest'
import crypto from 'crypto'

// Make sure config picks up the webhook secret before the client module loads.
beforeAll(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret'
    process.env.RAZORPAY_KEY_SECRET = 'test-key-secret'
})

describe('payments/razorpay.client', () => {
    it('verifyPaymentSignature returns true for a correct HMAC and false otherwise', async () => {
        const mod = await import('../../src/modules/payments/razorpay.client')
        const orderId = 'order_abc'
        const paymentId = 'pay_xyz'
        const expected = crypto.createHmac('sha256', 'test-key-secret').update(`${orderId}|${paymentId}`).digest('hex')

        await expect(mod.verifyPaymentSignature(orderId, paymentId, expected)).resolves.toBe(true)
        await expect(mod.verifyPaymentSignature(orderId, paymentId, 'wrong')).resolves.toBe(false)
    })

    it('verifyWebhookSignature matches a body signed with the shared secret', async () => {
        const mod = await import('../../src/modules/payments/razorpay.client')
        const body = JSON.stringify({ event: 'payment.captured', id: 'evt_1' })
        const expected = crypto.createHmac('sha256', 'test-webhook-secret').update(body).digest('hex')

        await expect(mod.verifyWebhookSignature(body, expected)).resolves.toBe(true)
        await expect(mod.verifyWebhookSignature(body, expected + 'a')).resolves.toBe(false)
    })

    it('verifyWebhookSignature rejects an empty signature without throwing', async () => {
        const mod = await import('../../src/modules/payments/razorpay.client')
        await expect(mod.verifyWebhookSignature('{}', '')).resolves.toBe(false)
    })
})
