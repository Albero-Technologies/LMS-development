import crypto from 'crypto'
import Razorpay from 'razorpay'
import config from '../../config/config'
import AppError from '../../util/AppError'

let client: Razorpay | null = null

export const getRazorpay = (): Razorpay => {
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
        throw AppError.badRequest('Razorpay is not configured', 'RAZORPAY_NOT_CONFIGURED')
    }
    if (!client) {
        client = new Razorpay({ key_id: config.RAZORPAY_KEY_ID, key_secret: config.RAZORPAY_KEY_SECRET })
    }
    return client
}

// Verify the handshake signature returned by the Razorpay Checkout callback.
export const verifyPaymentSignature = (orderId: string, paymentId: string, signature: string): boolean => {
    if (!config.RAZORPAY_KEY_SECRET) return false
    const expected = crypto.createHmac('sha256', config.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex')
    return safeEqual(expected, signature)
}

// Verify webhook payload signature against the shared webhook secret.
export const verifyWebhookSignature = (rawBody: string, signature: string): boolean => {
    if (!config.RAZORPAY_WEBHOOK_SECRET) return false
    const expected = crypto.createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex')
    return safeEqual(expected, signature)
}

const safeEqual = (a: string, b: string): boolean => {
    const ab = Buffer.from(a, 'utf8')
    const bb = Buffer.from(b, 'utf8')
    if (ab.length !== bb.length) return false
    return crypto.timingSafeEqual(ab, bb)
}
