import Redis from 'ioredis'
import config from '../config/config'
import logger from '../util/logger'

let client: Redis | null = null

export const getRedis = (): Redis => {
    if (client) return client

    client = new Redis(config.REDIS_URL, {
        maxRetriesPerRequest: null, // required by BullMQ
        enableReadyCheck: true,
        lazyConnect: false
    })

    client.on('error', (err) => {
        logger.error('REDIS_ERROR', { meta: { message: err.message } })
    })

    client.on('connect', () => {
        logger.info('REDIS_CONNECTED', { meta: { url: config.REDIS_URL.replace(/:[^:@/]+@/, ':***@') } })
    })

    return client
}

export const closeRedis = async (): Promise<void> => {
    if (client) {
        await client.quit()
        client = null
    }
}
