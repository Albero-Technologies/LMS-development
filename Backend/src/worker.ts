// See server.ts for the rationale — Neon publishes AAAA records that some
// local networks can't route to, so we force IPv4-first DNS resolution.
import dns from 'dns'
dns.setDefaultResultOrder('ipv4first')

import { Worker } from 'bullmq'
import { NOTIFY_QUEUE_NAME, type TNotifyJobData } from './modules/notifications/notification.queue'
import { processNotificationJob } from './modules/notifications/notification.service'
import { getRedis, closeRedis } from './service/redis'
import db from './service/db'
import logger from './util/logger'

const bootWorker = async () => {
    await db.connect()
    const connection = getRedis()

    const worker = new Worker<TNotifyJobData>(
        NOTIFY_QUEUE_NAME,
        async (job) => {
            await processNotificationJob(job.data)
        },
        {
            connection,
            concurrency: 10,
            removeOnComplete: { age: 24 * 3600, count: 1000 },
            removeOnFail: { age: 7 * 24 * 3600 }
        }
    )

    worker.on('ready', () => logger.info('NOTIFY_WORKER_READY'))
    worker.on('completed', (job) => logger.info('NOTIFY_JOB_COMPLETE', { meta: { id: job.id } }))
    worker.on('failed', (job, err) => logger.warn('NOTIFY_JOB_FAILED', { meta: { id: job?.id, attempt: job?.attemptsMade, err: err.message } }))

    const shutdown = async (signal: string) => {
        logger.info('WORKER_SHUTDOWN', { meta: { signal } })
        await worker.close()
        await db.disconnect()
        await closeRedis()
        process.exit(0)
    }
    process.on('SIGTERM', () => void shutdown('SIGTERM'))
    process.on('SIGINT', () => void shutdown('SIGINT'))
}

bootWorker().catch((err) => {
    logger.error('WORKER_BOOT_ERROR', { meta: { message: (err as Error).message } })
    process.exit(1)
})
