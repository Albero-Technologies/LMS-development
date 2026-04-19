import config from '../../config/config'

type TRenderInput = {
    template: string
    data: Record<string, unknown>
    tenantName?: string
}

type TRendered = { subject: string; html: string; text: string }

// Phase 1 templates — inline HTML so we don't need an external template store.
// Phase 2 migrates these to SendGrid Dynamic Templates (tracker P2-NT-02).
export const render = ({ template, data, tenantName }: TRenderInput): TRendered => {
    const brand = tenantName || config.SENDGRID_FROM_NAME

    switch (template) {
        case 'welcome':
            return {
                subject: `Welcome to ${brand}`,
                text: `Hi ${String(data.firstName ?? 'there')}, welcome to ${brand}! Your account is ready. Sign in to continue.`,
                html: `<p>Hi <strong>${String(data.firstName ?? 'there')}</strong>,</p>
<p>Welcome to <strong>${brand}</strong>! Your account is ready. Sign in to continue.</p>`
            }

        case 'invite':
            return {
                subject: `You've been invited to join ${brand}`,
                text: `You've been invited as ${String(data.role)}. Accept: ${config.SERVER_URL}/api/v1/auth/invites?token=${String(data.token)}`,
                html: `<p>You've been invited to join <strong>${brand}</strong> as <strong>${String(data.role)}</strong>.</p>
<p><a href="${config.SERVER_URL}/api/v1/auth/invites?token=${String(data.token)}">Accept invitation</a></p>
<p>This invite expires in 7 days.</p>`
            }

        case 'enrollment':
            return {
                subject: `You're enrolled in ${String(data.courseTitle ?? 'a course')}`,
                text: `You're enrolled in ${String(data.courseTitle ?? 'the course')}. Start learning now.`,
                html: `<p>You're enrolled in <strong>${String(data.courseTitle ?? 'the course')}</strong>.</p>
<p>Log in to start learning.</p>`
            }

        case 'payment':
            return {
                subject: `Payment received — Invoice ${String(data.invoiceNumber ?? '')}`,
                text: `We've received your payment of ${String(data.amount ?? '')} ${String(data.currency ?? 'INR')}. Invoice #${String(data.invoiceNumber ?? '')}.`,
                html: `<p>Payment received.</p>
<p><strong>Invoice:</strong> ${String(data.invoiceNumber ?? '')}<br/>
<strong>Amount:</strong> ${String(data.amount ?? '')} ${String(data.currency ?? 'INR')}</p>
<p>${data.pdfUrl ? `<a href="${String(data.pdfUrl)}">Download invoice PDF</a>` : ''}</p>`
            }

        case 'counsellor_signup_received':
            return {
                subject: `New student onboarded — ${String(data.firstName ?? '')} ${String(data.lastName ?? '')}`.trim(),
                text: `A new student (${String(data.firstName ?? '')} ${String(data.lastName ?? '')}, ${String(data.email ?? '')}) just signed up via your link.`,
                html: `<p>A new student just signed up via your onboarding link.</p>
<p><strong>${String(data.firstName ?? '')} ${String(data.lastName ?? '')}</strong> (${String(data.email ?? '')})</p>`
            }

        case 'counsellor_task_assigned':
            return {
                subject: `New task: ${String(data.title ?? '')}`,
                text: `You have a new task: ${String(data.title ?? '')}${data.dueAt ? ` — due ${String(data.dueAt)}` : ''}.`,
                html: `<p>You have a new task assigned.</p>
<p><strong>${String(data.title ?? '')}</strong>${data.dueAt ? `<br/>Due: ${String(data.dueAt)}` : ''}<br/>Priority: ${String(data.priority ?? 'NORMAL')}</p>`
            }

        case 'counsellor_task_completed':
            return {
                subject: `Task completed: ${String(data.title ?? '')}`,
                text: `Task "${String(data.title ?? '')}" was marked complete.`,
                html: `<p>Task <strong>${String(data.title ?? '')}</strong> has been marked complete.</p>`
            }

        case 'manager_signup_received':
            return {
                subject: `Team activity: ${String(data.counsellorName ?? 'A counsellor')} onboarded a student`,
                text: `${String(data.counsellorName ?? 'A counsellor')} onboarded ${String(data.studentName ?? 'a new student')} (${String(data.studentEmail ?? '')}).`,
                html: `<p><strong>${String(data.counsellorName ?? 'A counsellor')}</strong> onboarded a new student.</p>
<p>${String(data.studentName ?? '')} — ${String(data.studentEmail ?? '')}</p>`
            }

        case 'manager_target_progress':
            return {
                subject: `Target update — ${String(data.counsellorName ?? 'a counsellor')}`,
                text: `${String(data.counsellorName ?? 'A counsellor')} is at ${String(data.completionPct ?? 0)}% of their ${String(data.metric ?? 'target')} target.`,
                html: `<p><strong>${String(data.counsellorName ?? 'A counsellor')}</strong> is at <strong>${String(data.completionPct ?? 0)}%</strong> of their ${String(data.metric ?? 'target')} target this period.</p>`
            }

        case 'ticket_update':
            return {
                subject: `Ticket ${String(data.ticketNumber ?? '')} — ${String(data.status ?? 'updated')}`,
                text: `Your support ticket ${String(data.ticketNumber ?? '')} is now ${String(data.status ?? 'updated')}.`,
                html: `<p>Your ticket <strong>${String(data.ticketNumber ?? '')}</strong> is now <strong>${String(data.status ?? 'updated')}</strong>.</p>
${data.message ? `<blockquote>${String(data.message)}</blockquote>` : ''}`
            }

        default:
            return {
                subject: `${brand} notification`,
                text: 'You have a new notification.',
                html: '<p>You have a new notification.</p>'
            }
    }
}
