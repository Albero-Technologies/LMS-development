import app from './app'
import config from './config/config'
import { initRateLimiter } from './config/rateLimiter'
import db from './service/db'
import { closeRedis, getRedis } from './service/redis'
import logger from './util/logger'

const server = app.listen(config.PORT)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
;(async () => {
    try {
        const connection = await db.connect()
        logger.info('DATABASE_CONNECTION', { meta: connection })

        // Touching Redis eagerly so startup fails fast if it's unreachable.
        getRedis()
        initRateLimiter()
        logger.info('RATE_LIMITER_INITIALIZED')

        logger.info('APPLICATION_STARTED', {
            meta: { PORT: config.PORT, SERVER_URL: config.SERVER_URL, ENV: config.ENV }
        })
    } catch (err) {
        logger.error('APPLICATION_ERROR', { meta: { message: (err as Error).message } })
        server.close(() => process.exit(1))
    }
})()

const shutdown = (signal: string): void => {
    logger.info('APPLICATION_SHUTDOWN', { meta: { signal } })
    server.close(async () => {
        try {
            await db.disconnect()
            await closeRedis()
        } catch (err) {
            logger.error('SHUTDOWN_ERROR', { meta: { message: (err as Error).message } })
        }
        process.exit(0)
    })
    // Force exit after 15s if server.close hangs.
    setTimeout(() => process.exit(1), 15_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
    logger.error('UNHANDLED_REJECTION', { meta: { reason: String(reason) } })
})

process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT_EXCEPTION', { meta: { message: err.message, stack: err.stack } })
})
