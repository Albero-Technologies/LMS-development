import { Queue, QueueEvents } from 'bullmq'
import { getRedis } from '../../service/redis'
import logger from '../../util/logger'

export const NOTIFY_QUEUE_NAME = 'notifications'
export const NOTIFY_JOB = 'send-notification'

export type TNotifyJobData = {
    tenantId: string
    userId?: string
    toEmail?: string
    toName?: string
    template: 'welcome' | 'invite' | 'enrollment' | 'payment' | 'ticket_update'
    subject?: string
    data: Record<string, unknown>
}

// Lazily construct the queue so tests can boot without Redis.
let _queue: Queue<TNotifyJobData> | null = null
let _events: QueueEvents | null = null

const buildConnection = () => getRedis()

export const notifyQueue = new Proxy({} as Queue<TNotifyJobData>, {
    get(_target, prop) {
        if (!_queue) {
            _queue = new Queue<TNotifyJobData>(NOTIFY_QUEUE_NAME, {
                connection: buildConnection(),
                defaultJobOptions: {
                    attempts: 5,
                    backoff: { type: 'exponential', delay: 5_000 },
                    removeOnComplete: { age: 24 * 3600, count: 1000 },
                    removeOnFail: { age: 7 * 24 * 3600 }
                }
            })
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (_queue as any)[prop as keyof Queue]
    }
})

export const getNotifyQueueEvents = (): QueueEvents => {
    if (!_events) {
        _events = new QueueEvents(NOTIFY_QUEUE_NAME, { connection: buildConnection() })
        _events.on('failed', ({ jobId, failedReason }) => {
            logger.warn('NOTIFICATION_JOB_FAILED', { meta: { jobId, failedReason } })
        })
    }
    return _events
}
