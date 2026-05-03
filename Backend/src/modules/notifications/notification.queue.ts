import { Queue, QueueEvents } from 'bullmq'
import { getRedis } from '../../service/redis'
import logger from '../../util/logger'

export const NOTIFY_QUEUE_NAME = 'notifications'
export const NOTIFY_JOB = 'send-notification'

export type NotificationTemplate =
    | 'welcome'
    | 'invite'
    | 'enrollment'
    | 'enrollment_credentials'
    | 'payment'
    | 'ticket_update'
    | 'counsellor_signup_received'
    | 'counsellor_task_assigned'
    | 'counsellor_task_completed'
    | 'manager_signup_received'
    | 'manager_target_progress'
    | 'billing_reminder'
    // New templates for the cash/EMI request workflow + payment confirmations
    | 'payment_request_submitted'
    | 'payment_request_approved'
    | 'payment_request_rejected'
    | 'payment_received_admin'
    | 'enquiry_assigned_counsellor'

export interface TNotifyJobData {
    tenantId: string
    userId?: string
    toEmail?: string
    toName?: string
    template: NotificationTemplate
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

// Robust notification helper. Always returns successfully — notifications
// are best-effort, never load-bearing. The order of attempts is:
//
//   1. Add the job to the BullMQ queue. The dedicated worker process picks
//      it up and runs `processNotificationJob` with retries + email send.
//   2. If the queue add fails (Redis down, network blip), fall back to
//      processing the job inline in this request. The Notification row
//      still gets created and the bell icon updates; if SMTP is down too,
//      mailer.ts logs MAILER_SKIPPED and we move on.
//
// Call this from any service that wants to fire a notification. It replaces
// raw `notifyQueue.add(NOTIFY_JOB, …)` calls and absorbs every error so the
// caller never has to remember a try/catch around what is fundamentally a
// best-effort side effect.
export const enqueueNotification = async (data: TNotifyJobData): Promise<void> => {
    try {
        await notifyQueue.add(NOTIFY_JOB, data, {
            // Smaller backoff than the default (5s) so the worker retries
            // quickly during dev when Redis flickers.
            attempts: 5,
            backoff: { type: 'exponential', delay: 2_000 }
        })
        return
    } catch (err) {
        logger.warn('NOTIFY_QUEUE_ADD_FAILED', { meta: { template: data.template, err: (err as Error).message } })
    }

    // Inline fallback. Imported lazily to avoid a circular import — the
    // notification service depends on this module for the queue type.
    try {
        const { processNotificationJob } = await import('./notification.service')
        await processNotificationJob(data)
    } catch (err) {
        logger.error('NOTIFY_INLINE_FALLBACK_FAILED', { meta: { template: data.template, err: (err as Error).message } })
    }
}
