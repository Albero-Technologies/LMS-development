import { NotificationChannel, NotificationStatus, type Prisma } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { render } from './notification.templates'
import { sendEmail } from './mailer'
import logger from '../../util/logger'
import { type TNotifyJobData } from './notification.queue'

// Resolve recipient user row. If only toEmail supplied (e.g. invite), the notification is
// logged as an "email-only" row without a userId.
const resolveRecipient = async (job: TNotifyJobData) => {
    if (job.userId) {
        const user = await db.client.user.findFirst({ where: { id: job.userId, tenantId: job.tenantId } })
        if (!user) return null
        return { userId: user.id, email: user.email, firstName: user.firstName }
    }
    if (job.toEmail) return { userId: null, email: job.toEmail, firstName: job.toName }
    return null
}

export const processNotificationJob = async (job: TNotifyJobData): Promise<void> => {
    const recipient = await resolveRecipient(job)
    if (!recipient) {
        logger.warn('NOTIFY_NO_RECIPIENT', { meta: { job } })
        return
    }

    const tenant = await db.client.tenant.findUnique({ where: { id: job.tenantId } })
    const rendered = render({ template: job.template, data: job.data, tenantName: tenant?.name })

    const notification = recipient.userId
        ? await db.client.notification.create({
              data: {
                  tenantId: job.tenantId,
                  userId: recipient.userId,
                  channel: NotificationChannel.EMAIL,
                  template: job.template,
                  subject: rendered.subject,
                  body: rendered.text,
                  data: (job.data as Prisma.InputJsonValue) ?? {},
                  status: NotificationStatus.PENDING
              }
          })
        : null

    try {
        await sendEmail({
            to: recipient.email,
            toName: recipient.firstName,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text
        })

        if (notification) {
            await db.client.notification.update({
                where: { id: notification.id },
                data: { status: NotificationStatus.SENT, sentAt: new Date() }
            })
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'send failed'
        if (notification) {
            await db.client.notification.update({
                where: { id: notification.id },
                data: { status: NotificationStatus.FAILED, error: msg }
            })
        }
        throw err // let BullMQ retry
    }
}

export const listMyNotifications = async (tenantId: string, userId: string, page: number, pageSize: number) => {
    const where: Prisma.NotificationWhereInput = { tenantId, userId }
    const [items, total, unread] = await Promise.all([
        db.client.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: { id: true, subject: true, body: true, status: true, readAt: true, createdAt: true, template: true }
        }),
        db.client.notification.count({ where }),
        db.client.notification.count({ where: { ...where, readAt: null } })
    ])
    return { items, total, unread, page, pageSize }
}

export const markAsRead = async (tenantId: string, userId: string, id: string) => {
    const existing = await db.client.notification.findFirst({ where: { id, tenantId, userId } })
    if (!existing) throw AppError.notFound(responseMessage.NOT_FOUND('Notification'))
    await db.client.notification.update({ where: { id }, data: { readAt: new Date(), status: NotificationStatus.READ } })
}
