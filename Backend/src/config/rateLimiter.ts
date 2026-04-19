import { RateLimiterRedis } from 'rate-limiter-flexible'
import { getRedis } from '../service/redis'

// Exported limiters — initialized on boot via initRateLimiter().
export let globalLimiter: RateLimiterRedis | null = null
export let authLimiter: RateLimiterRedis | null = null
export let webhookLimiter: RateLimiterRedis | null = null

export const initRateLimiter = (): void => {
    const redis = getRedis()

    globalLimiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:global',
        points: 120, // 120 requests
        duration: 60 // per 60 seconds per IP
    })

    // Login throttle — 5 failed attempts per email per 15 min (PRD 13.4).
    authLimiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:auth',
        points: 5,
        duration: 60 * 15,
        blockDuration: 60 * 15
    })

    // Webhooks — generous per-IP rate limit.
    webhookLimiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:webhook',
        points: 300,
        duration: 60
    })
}
