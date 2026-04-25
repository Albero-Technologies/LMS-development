// One-off: clear the login rate-limiter lockout for one or more emails.
//
// Usage:
//   npx ts-node script/clearLoginLockout.ts                 (clears all rl:auth:* keys)
//   npx ts-node script/clearLoginLockout.ts foo@bar.com baz@qux.com
//
// The auth limiter keys live under `rl:auth:login:<email>` (see
// config/rateLimiter.ts + auth.service.ts), so we just delete those.

import 'dotenv/config'
import Redis from 'ioredis'

async function main() {
    const url = process.env.REDIS_URL
    if (!url) {
        console.error('REDIS_URL not set — load .env.development first')
        process.exit(1)
    }
    const r = new Redis(url, { maxRetriesPerRequest: 3 })
    const args = process.argv.slice(2)

    if (args.length === 0) {
        // Clear them all.
        const keys = await r.keys('rl:auth:*')
        if (keys.length === 0) {
            console.log('No login lockouts found — nothing to clear.')
        } else {
            await r.del(...keys)
            console.log(`Cleared ${keys.length} login lockout key(s).`)
        }
    } else {
        for (const email of args) {
            const key = `rl:auth:login:${email.toLowerCase()}`
            const removed = await r.del(key)
            console.log(`${email} → ${removed > 0 ? 'cleared' : 'no lockout'}`)
        }
    }

    await r.quit()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
