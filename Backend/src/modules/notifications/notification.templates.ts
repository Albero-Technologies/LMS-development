import config from '../../config/config'

interface TRenderInput {
    template: string
    data: Record<string, unknown>
    tenantName?: string
}

interface TRendered {
    subject: string
    html: string
    text: string
}

// Phase 1 templates — inline HTML so we don't need an external template store.
// Phase 2 will move these to a per-tenant template store rendered via Handlebars.
export const render = ({ template, data, tenantName }: TRenderInput): TRendered => {
    const brand = tenantName || config.MAIL_FROM_NAME

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

        case 'enrollment_credentials': {
            // Sent right after a public Razorpay checkout. The user paid as an
            // anonymous prospect; we created their student account on the fly,
            // so this email carries their first-time login credentials AND a
            // one-time "set your new password" link. The set-password URL is
            // the recommended path — the temp password is a fallback if the
            // link expires or the email gets forwarded to someone else.
            const firstName = String(data.firstName ?? 'there')
            const courseTitle = String(data.courseTitle ?? 'the course')
            const email = String(data.email ?? '')
            const tempPassword = String(data.tempPassword ?? '')
            const loginUrl = String(data.loginUrl ?? config.SERVER_URL)
            const setPasswordUrl = String(data.setPasswordUrl ?? '')
            const tenantName = String(data.tenantName || brand)
            const brandColor = String(data.brandColor ?? '#0d4f3c')
            const brandLogo = data.brandLogo ? String(data.brandLogo) : null

            const text =
                `Hi ${firstName},\n\n` +
                `Payment received and your seat in ${courseTitle} is confirmed.\n\n` +
                `Set your password: ${setPasswordUrl || loginUrl}\n\n` +
                `Or sign in with these credentials:\n` +
                `  Email: ${email}\n` +
                `  Temporary password: ${tempPassword}\n` +
                `  Sign-in URL: ${loginUrl}\n\n` +
                `This temporary password expires once you set a new one.\n\n` +
                `Next steps:\n` +
                `  1. Set your new password from the link above\n` +
                `  2. Open your student portal and meet your cohort\n` +
                `  3. Watch for batch start-date confirmation\n\n` +
                `— Team ${tenantName}`

            return {
                subject: `Welcome to ${tenantName} — your login details inside 🎓`,
                text,
                html: renderEnrollmentCredentialsHtml({
                    firstName,
                    courseTitle,
                    email,
                    tempPassword,
                    loginUrl,
                    setPasswordUrl,
                    tenantName,
                    brandColor,
                    brandLogo
                })
            }
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

        case 'billing_reminder': {
            const amount = String(data.amount ?? '')
            const currency = String(data.currency ?? 'INR')
            const dueDate = String(data.dueDate ?? '')
            const planLabel = String(data.planLabel ?? '')
            const note = data.note ? String(data.note) : ''
            const lines = [
                `This is a reminder for your ${brand} subscription.`,
                amount ? `Amount due: ${currency} ${amount}` : '',
                dueDate ? `Due date: ${dueDate}` : '',
                planLabel ? `Plan: ${planLabel}` : '',
                note ? `\nNote from your account manager:\n${note}` : '',
                '',
                `Log in to settle the invoice or reach out if you have questions.`
            ].filter(Boolean)
            return {
                subject: `Billing reminder — ${planLabel || brand}`,
                text: lines.join('\n'),
                html: `<p>This is a reminder for your <strong>${brand}</strong> subscription.</p>
${amount ? `<p><strong>Amount due:</strong> ${currency} ${amount}</p>` : ''}
${dueDate ? `<p><strong>Due date:</strong> ${dueDate}</p>` : ''}
${planLabel ? `<p><strong>Plan:</strong> ${planLabel}</p>` : ''}
${note ? `<blockquote>${note}</blockquote>` : ''}
<p>Log in to settle the invoice or reach out if you have questions.</p>`
            }
        }

        case 'enquiry_assigned_counsellor': {
            // Pinged at the counsellor when round-robin assigns them a new
            // enquiry. Keeps the bell icon useful for them — without this
            // they had to refresh the pipeline page to see new leads.
            const studentName = String(data.studentName ?? 'A new prospect')
            const courseTitle = String(data.courseTitle ?? '')
            return {
                subject: `New enquiry assigned — ${studentName}`,
                text: `${studentName} just enquired${courseTitle ? ` about ${courseTitle}` : ''}. Open the lead pipeline to follow up.`,
                html: `<p><strong>${studentName}</strong> just submitted an enquiry${courseTitle ? ` for <strong>${courseTitle}</strong>` : ''}.</p>
<p>Open the <a href="${config.SERVER_URL.replace('/api/v1', '')}/app/counsellor/pipeline">Lead Pipeline</a> to schedule a follow-up.</p>`
            }
        }

        case 'payment_request_submitted': {
            // Counsellor → admin. Sent when a counsellor requests offline
            // payment (cash / EMI) for a student so the admin knows there's
            // an approval waiting in their queue.
            const counsellor = String(data.counsellorName ?? 'A counsellor')
            const student = String(data.studentName ?? 'a student')
            const method = String(data.method ?? 'OFFLINE')
            const amount = String(data.amountDisplay ?? '')
            return {
                subject: `Payment request awaiting approval — ${student}`,
                text: `${counsellor} requested a ${method} payment of ${amount} for ${student}. Approve or reject in the admin console.`,
                html: `<p><strong>${counsellor}</strong> requested a <strong>${method}</strong> payment for <strong>${student}</strong>.</p>
<p><strong>Amount:</strong> ${amount}</p>
${data.note ? `<blockquote>${String(data.note)}</blockquote>` : ''}
<p>Open the admin console to approve or reject.</p>`
            }
        }

        case 'payment_request_approved': {
            const student = String(data.studentName ?? 'the student')
            const method = String(data.method ?? '')
            const amount = String(data.amountDisplay ?? '')
            return {
                subject: `Payment request approved — ${student}`,
                text: `Your ${method} payment request of ${amount} for ${student} was approved. The invoice has been marked paid.`,
                html: `<p>Your <strong>${method}</strong> payment request for <strong>${student}</strong> was approved.</p>
<p><strong>Amount:</strong> ${amount}</p>
${data.invoiceNumber ? `<p><strong>Invoice:</strong> ${String(data.invoiceNumber)}</p>` : ''}`
            }
        }

        case 'payment_request_rejected': {
            const student = String(data.studentName ?? 'the student')
            const method = String(data.method ?? '')
            return {
                subject: `Payment request rejected — ${student}`,
                text: `Your ${method} payment request for ${student} was rejected.${data.reason ? ` Reason: ${String(data.reason)}` : ''}`,
                html: `<p>Your <strong>${method}</strong> payment request for <strong>${student}</strong> was rejected.</p>
${data.reason ? `<blockquote>${String(data.reason)}</blockquote>` : ''}
<p>Reach out to the admin if you'd like to revise the request.</p>`
            }
        }

        case 'payment_received_admin': {
            // Heads-up to admin / manager when a public Razorpay checkout
            // completes. Useful for the sales-funnel "live" feel.
            const studentName = String(data.studentName ?? 'A student')
            const courseTitle = String(data.courseTitle ?? '')
            const amount = String(data.amountDisplay ?? '')
            const method = String(data.method ?? 'ONLINE')
            return {
                subject: `Payment received — ${studentName} · ${amount}`,
                text: `${studentName} just paid ${amount} (${method}) for ${courseTitle}.`,
                html: `<p><strong>${studentName}</strong> just paid <strong>${amount}</strong> (${method}) for <strong>${courseTitle}</strong>.</p>
${data.invoiceNumber ? `<p>Invoice: <code>${String(data.invoiceNumber)}</code></p>` : ''}`
            }
        }

        default:
            return {
                subject: `${brand} notification`,
                text: 'You have a new notification.',
                html: '<p>You have a new notification.</p>'
            }
    }
}

// HTML escape — Gmail clients are forgiving but variable interpolation
// (firstName, courseTitle, …) can come from user input on the public
// purchase form. Escape everything before substituting into the template.
const esc = (raw: string): string =>
    raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

// Branded enrollment-welcome HTML email. Inline CSS only (Gmail strips
// <style> blocks), max-width 600px, white card on light grey background,
// tenant brand colour banner. Sections in order:
//   1. Logo + brand banner
//   2. Personalised greeting with course title
//   3. Set-password CTA button (primary action)
//   4. Credentials box (email + temp password) — fallback path
//   5. Next-steps checklist
//   6. Footer
const renderEnrollmentCredentialsHtml = (input: {
    firstName: string
    courseTitle: string
    email: string
    tempPassword: string
    loginUrl: string
    setPasswordUrl: string
    tenantName: string
    brandColor: string
    brandLogo: string | null
}): string => {
    const c = input.brandColor || '#0d4f3c'
    const logoHtml = input.brandLogo
        ? `<img src="${esc(input.brandLogo)}" alt="${esc(input.tenantName)}" width="120" height="40" style="display:block;border:0;outline:none;text-decoration:none;max-height:40px;width:auto;" />`
        : `<div style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;">${esc(input.tenantName)}</div>`

    const ctaUrl = input.setPasswordUrl || input.loginUrl

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Welcome to ${esc(input.tenantName)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06);">
      <!-- Banner -->
      <tr>
        <td style="background:${c};padding:28px 32px;">
          ${logoHtml}
        </td>
      </tr>
      <!-- Body -->
      <tr><td style="padding:32px 32px 12px;">
        <p style="margin:0 0 12px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Enrolment confirmed</p>
        <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#0f172a;font-weight:700;">
          Hi ${esc(input.firstName)}, you're in.
        </h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#334155;">
          Your seat in <strong style="color:${c};">${esc(input.courseTitle)}</strong> is confirmed and your student account is ready.
          Set your new password from the button below — it takes ten seconds.
        </p>
      </td></tr>
      <!-- CTA -->
      <tr><td style="padding:0 32px 24px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="border-radius:999px;background:${c};">
            <a href="${esc(ctaUrl)}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;font-family:inherit;">
              Set your new password →
            </a>
          </td></tr>
        </table>
      </td></tr>
      <!-- Credentials fallback -->
      <tr><td style="padding:0 32px 24px;">
        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">
          Or sign in with the temporary credentials below — this password expires once you set a new one.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
          <tr><td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Email</div>
            <code style="display:block;font-family:'SF Mono','Menlo','Consolas',monospace;font-size:14px;color:#0f172a;margin-top:4px;word-break:break-all;">${esc(input.email)}</code>
          </td></tr>
          <tr><td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Temporary password</div>
            <code style="display:block;font-family:'SF Mono','Menlo','Consolas',monospace;font-size:14px;color:#0f172a;margin-top:4px;word-break:break-all;">${esc(input.tempPassword)}</code>
          </td></tr>
          <tr><td style="padding:14px 16px;">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Sign-in URL</div>
            <a href="${esc(input.loginUrl)}" style="display:block;font-family:'SF Mono','Menlo','Consolas',monospace;font-size:13px;color:${c};margin-top:4px;word-break:break-all;text-decoration:none;">${esc(input.loginUrl)}</a>
          </td></tr>
        </table>
      </td></tr>
      <!-- Next steps -->
      <tr><td style="padding:0 32px 24px;">
        <h2 style="margin:0 0 14px;font-size:16px;font-weight:700;color:#0f172a;">Your first steps</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:8px 0;font-size:14px;color:#334155;line-height:1.5;">
            <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${c};color:#ffffff;font-size:12px;text-align:center;line-height:22px;font-weight:700;margin-right:10px;vertical-align:middle;">1</span>
            Set your new password using the button above.
          </td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#334155;line-height:1.5;">
            <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${c};color:#ffffff;font-size:12px;text-align:center;line-height:22px;font-weight:700;margin-right:10px;vertical-align:middle;">2</span>
            Open your student dashboard — your course materials are waiting.
          </td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#334155;line-height:1.5;">
            <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${c};color:#ffffff;font-size:12px;text-align:center;line-height:22px;font-weight:700;margin-right:10px;vertical-align:middle;">3</span>
            Watch your inbox for the batch start-date and onboarding call invite.
          </td></tr>
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 6px;font-size:12px;color:#64748b;">Sent by <strong style="color:#334155;">${esc(input.tenantName)}</strong>. Reply to this email and a counsellor will get back to you.</p>
        <p style="margin:0;font-size:11px;color:#94a3b8;">If you didn't expect this email, you can safely ignore it.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

