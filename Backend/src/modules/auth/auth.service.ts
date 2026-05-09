import { AuthProvider, InviteStatus, Role, UserStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { comparePassword, hashPassword } from '../../util/password'
import { hashToken, randomToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../util/tokens'
import config from '../../config/config'
import { type TAcceptInviteInput, type TChangePasswordInput, type TLoginInput, type TRegisterInput, type TUpdateProfileInput } from './auth.schema'
import { authLimiter } from '../../config/rateLimiter'
import { writeAudit } from '../../util/audit'
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'
import type { Request } from 'express'

interface TTokenBundle {
    accessToken: string
    refreshToken: string
}

const issueTokens = async (
    user: { id: string; tenantId: string; role: Role; tokenVersion: number },
    context: { userAgent?: string; ipAddress?: string }
): Promise<TTokenBundle> => {
    // tokens.ts expects `userId`; Prisma rows use `id` — remap once here.
    const tokenInput = {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        tokenVersion: user.tokenVersion
    }
    const accessToken = signAccessToken(tokenInput)
    const refreshToken = signRefreshToken(tokenInput)
    const tokenHash = hashToken(refreshToken)

    await db.client.refreshToken.create({
        data: {
            userId: user.id,
            tenantId: user.tenantId,
            tokenHash,
            userAgent: context.userAgent,
            ipAddress: context.ipAddress,
            expiresAt: new Date(Date.now() + config.JWT_REFRESH_TTL_SECONDS * 1000)
        }
    })

    return { accessToken, refreshToken }
}

const findTenantBySlug = async (slug: string) => {
    const tenant = await db.client.tenant.findUnique({ where: { slug } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    if (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
        throw AppError.forbidden('Tenant is not active', 'TENANT_INACTIVE')
    }
    return tenant
}

export const register = async (input: TRegisterInput, req: Request) => {
    const tenant = await findTenantBySlug(input.tenantSlug)

    const existing = await db.client.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: input.email.toLowerCase() } }
    })
    if (existing) throw AppError.conflict(responseMessage.ALREADY_EXISTS('User'), 'USER_EXISTS')

    const user = await db.client.user.create({
        data: {
            tenantId: tenant.id,
            email: input.email.toLowerCase(),
            phone: input.phone,
            passwordHash: await hashPassword(input.password),
            firstName: input.firstName,
            lastName: input.lastName,
            role: Role.STUDENT, // public registration always creates students
            status: UserStatus.ACTIVE,
            provider: AuthProvider.LOCAL
        }
    })

    await writeAudit({ action: 'auth.register', entityType: 'User', entityId: user.id, tenantId: tenant.id, userId: user.id }, req)
    await notifyQueue.add(NOTIFY_JOB, {
        tenantId: tenant.id,
        userId: user.id,
        template: 'welcome',
        data: { firstName: user.firstName }
    })

    const tokens = await issueTokens(user, { ipAddress: req.ip, userAgent: req.headers['user-agent'] })
    return { user: sanitize(user), ...tokens }
}

// Whitelist gate: loopback IPs always bypass the auth limiter (so an SA
// debugging on localhost can hammer login as much as they like), plus any IPs
// listed in RATE_LIMIT_WHITELIST. Centralised here so we can reuse for the
// global limiter later if needed.
const LOOPBACK_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const isWhitelistedIp = (ip: string | undefined): boolean => {
    if (!ip) return false
    if (LOOPBACK_IPS.has(ip)) return true
    return config.RATE_LIMIT_WHITELIST.includes(ip)
}

export const login = async (input: TLoginInput, req: Request) => {
    // Throttle by email — 5 failed per 15 min. Skip entirely for whitelisted IPs.
    const key = `login:${input.email.toLowerCase()}`
    if (authLimiter && !isWhitelistedIp(req.ip)) {
        try {
            await authLimiter.consume(key, 1)
        } catch {
            throw AppError.tooMany(responseMessage.TOO_MANY_LOGIN_ATTEMPTS, 'LOGIN_RATE_LIMIT')
        }
    }

    const where = input.tenantSlug
        ? { tenantId_email: { tenantId: (await findTenantBySlug(input.tenantSlug)).id, email: input.email.toLowerCase() } }
        : undefined

    // If tenantSlug not given, try a unique lookup by email across tenants (single-tenant bootstrap).
    const user = where
        ? await db.client.user.findUnique({ where })
        : await db.client.user.findFirst({ where: { email: input.email.toLowerCase(), deletedAt: null } })

    if (!user?.passwordHash) {
        throw AppError.unauthorized(responseMessage.INVALID_CREDENTIALS, 'INVALID_CREDENTIALS')
    }
    if (user.status === UserStatus.SUSPENDED) throw AppError.forbidden(responseMessage.ACCOUNT_SUSPENDED, 'SUSPENDED')

    const ok = await comparePassword(input.password, user.passwordHash)
    if (!ok) throw AppError.unauthorized(responseMessage.INVALID_CREDENTIALS, 'INVALID_CREDENTIALS')

    // Reset throttle on success.
    if (authLimiter) await authLimiter.delete(key).catch(() => void 0)

    await db.client.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    await writeAudit({ action: 'auth.login', entityType: 'User', entityId: user.id, tenantId: user.tenantId, userId: user.id }, req)

    const tokens = await issueTokens(user, { ipAddress: req.ip, userAgent: req.headers['user-agent'] })
    return { user: sanitize(user), ...tokens }
}

export const refresh = async (refreshToken: string, req: Request) => {
    let decoded
    try {
        decoded = verifyRefreshToken(refreshToken)
    } catch {
        throw AppError.unauthorized(responseMessage.INVALID_TOKEN, 'INVALID_REFRESH')
    }

    const tokenHash = hashToken(refreshToken)
    const existing = await db.client.refreshToken.findUnique({ where: { tokenHash } })
    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
        throw AppError.unauthorized(responseMessage.INVALID_TOKEN, 'REFRESH_REVOKED')
    }

    const user = await db.client.user.findFirst({ where: { id: decoded.sub, tenantId: decoded.tid, deletedAt: null } })
    if (!user) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
    if (user.tokenVersion !== decoded.ver) throw AppError.unauthorized(responseMessage.INVALID_TOKEN, 'TOKEN_STALE')

    // Rotate — revoke old, issue new.
    const tokens = await issueTokens(user, { ipAddress: req.ip, userAgent: req.headers['user-agent'] })
    const newHash = hashToken(tokens.refreshToken)
    const newRow = await db.client.refreshToken.findUnique({ where: { tokenHash: newHash } })
    await db.client.refreshToken.update({
        where: { tokenHash },
        data: { revokedAt: new Date(), replacedById: newRow?.id }
    })

    return { user: sanitize(user), ...tokens }
}

export const logout = async (refreshToken: string | undefined, userId: string) => {
    if (refreshToken) {
        const tokenHash = hashToken(refreshToken)
        await db.client.refreshToken.updateMany({
            where: { tokenHash, userId, revokedAt: null },
            data: { revokedAt: new Date() }
        })
    } else {
        // Revoke all active sessions.
        await db.client.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })
    }
}

export const acceptInvite = async (input: TAcceptInviteInput, req: Request) => {
    const tokenHash = hashToken(input.token)
    const invite = await db.client.invite.findUnique({ where: { tokenHash } })
    if (!invite) throw AppError.notFound(responseMessage.NOT_FOUND('Invite'), 'INVITE_NOT_FOUND')
    if (invite.status !== InviteStatus.PENDING) throw AppError.badRequest('Invite already used', 'INVITE_USED')
    if (invite.expiresAt < new Date()) {
        await db.client.invite.update({ where: { id: invite.id }, data: { status: InviteStatus.EXPIRED } })
        throw AppError.badRequest('Invite expired', 'INVITE_EXPIRED')
    }

    // Upsert — accepting an invite for an email that already has a pending user record is fine.
    const existing = await db.client.user.findUnique({
        where: { tenantId_email: { tenantId: invite.tenantId, email: invite.email.toLowerCase() } }
    })

    let user
    if (existing) {
        user = await db.client.user.update({
            where: { id: existing.id },
            data: {
                passwordHash: await hashPassword(input.password),
                firstName: input.firstName,
                lastName: input.lastName,
                phone: input.phone,
                role: invite.role,
                status: UserStatus.ACTIVE,
                emailVerified: true
            }
        })
    } else {
        user = await db.client.user.create({
            data: {
                tenantId: invite.tenantId,
                email: invite.email.toLowerCase(),
                passwordHash: await hashPassword(input.password),
                firstName: input.firstName,
                lastName: input.lastName,
                phone: input.phone,
                role: invite.role,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                provider: AuthProvider.LOCAL
            }
        })
    }

    await db.client.invite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.ACCEPTED, acceptedAt: new Date() }
    })
    await writeAudit({ action: 'auth.invite_accepted', entityType: 'User', entityId: user.id, tenantId: user.tenantId, userId: user.id }, req)

    const bundle = await issueTokens(user, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    })
    return { user: sanitize(user), ...bundle }
}

// Issue a one-time password-reset token. Stored hashed (sha-256) so a
// breach of password_reset_tokens doesn't leak the URL itself. The plaintext
// token is the bit we email + URL-encode; we only ever match against
// `tokenHash`. Default purpose is `enrollment_welcome` because the public
// purchase flow is the primary caller.
export const createPasswordResetToken = async (
    userId: string,
    purpose = 'enrollment_welcome',
    ttlMinutes = 60 * 24
): Promise<{ token: string; expiresAt: Date }> => {
    const token = randomToken(24)
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
    await db.client.passwordResetToken.create({
        data: { userId, tokenHash, purpose, expiresAt }
    })
    return { token, expiresAt }
}

const findUsableResetToken = async (token: string) => {
    const tokenHash = hashToken(token)
    const row = await db.client.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: { select: { id: true, tenantId: true, email: true, status: true, deletedAt: true } } }
    })
    if (!row) throw AppError.notFound('Reset link is invalid or has expired', 'TOKEN_NOT_FOUND')
    if (row.usedAt) throw AppError.badRequest('Reset link has already been used', 'TOKEN_USED')
    if (row.expiresAt.getTime() < Date.now()) throw AppError.badRequest('Reset link has expired', 'TOKEN_EXPIRED')
    if (!row.user || row.user.deletedAt) throw AppError.notFound(responseMessage.NOT_FOUND('User'), 'USER_NOT_FOUND')
    return row
}

const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@')
    if (!domain) return email
    if (local.length <= 2) return `${local[0]}***@${domain}`
    return `${local[0]}${local[1]}***${local[local.length - 1]}@${domain}`
}

// Pre-flight check from the set-password page — used to render
// "Set password for j***@gmail.com" without leaking the full address until
// the token is consumed. Doesn't burn the token.
export const verifyPasswordResetToken = async (token: string) => {
    const row = await findUsableResetToken(token)
    return {
        valid: true,
        purpose: row.purpose,
        expiresAt: row.expiresAt.toISOString(),
        maskedEmail: maskEmail(row.user.email)
    }
}

// Consume the token: set the new password, bump tokenVersion to invalidate
// any stray sessions, mark the token used, and issue a fresh JWT pair so
// the user lands signed-in. Idempotent: second call hits TOKEN_USED.
export const setPasswordWithToken = async (
    token: string,
    newPassword: string,
    req: Request
): Promise<TTokenBundle & { user: { id: string; tenantId: string; email: string } }> => {
    const row = await findUsableResetToken(token)
    const passwordHash = await hashPassword(newPassword)

    const updated = await db.client.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id: row.userId },
            data: {
                passwordHash,
                tokenVersion: { increment: 1 },
                // Activate the account on first password set — useful for the
                // public-purchase path which leaves the row ACTIVE already
                // but covers any future flow that creates pending-credentials
                // accounts.
                status: row.user.status === UserStatus.PENDING ? UserStatus.ACTIVE : row.user.status,
                emailVerified: true
            },
            select: { id: true, tenantId: true, role: true, tokenVersion: true, email: true }
        })
        await tx.passwordResetToken.update({
            where: { id: row.id },
            data: { usedAt: new Date() }
        })
        return user
    })

    const tokens = await issueTokens(updated, { ipAddress: req.ip, userAgent: req.headers['user-agent'] })
    await writeAudit(
        { action: 'auth.password_set_with_token', entityType: 'User', entityId: updated.id, tenantId: updated.tenantId, userId: updated.id, metadata: { purpose: row.purpose } },
        req
    )
    return { ...tokens, user: { id: updated.id, tenantId: updated.tenantId, email: updated.email } }
}

export const changePassword = async (userId: string, input: TChangePasswordInput, req: Request) => {
    const user = await db.client.user.findUnique({ where: { id: userId }, select: { passwordHash: true, tenantId: true } })
    if (!user?.passwordHash) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)

    const ok = await comparePassword(input.currentPassword, user.passwordHash)
    if (!ok) throw AppError.badRequest('Current password is incorrect', 'INVALID_PASSWORD')

    // tokenVersion bump invalidates other sessions; the new access token will
    // be issued by the next refresh round-trip.
    await db.client.user.update({
        where: { id: userId },
        data: { passwordHash: await hashPassword(input.newPassword), tokenVersion: { increment: 1 } }
    })
    await writeAudit({ action: 'auth.password_change', entityType: 'User', entityId: userId, tenantId: user.tenantId, userId }, req)
}

export const updateProfile = async (userId: string, tenantId: string, input: TUpdateProfileInput, req: Request) => {
    const data: Record<string, unknown> = {}
    if (input.firstName !== undefined) data.firstName = input.firstName.trim()
    if (input.lastName !== undefined) data.lastName = input.lastName.trim()
    if (input.phone !== undefined) data.phone = input.phone === '' ? null : input.phone

    const user = await db.client.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            tenantId: true,
            email: true,
            phone: true,
            role: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            status: true
        }
    })
    await writeAudit({ action: 'auth.profile_update', entityType: 'User', entityId: userId, tenantId, userId }, req)
    return sanitize(user)
}

export const createInvite = async (tenantId: string, email: string, role: Role, invitedById: string) => {
    const rawToken = randomToken(24)
    const tokenHash = hashToken(rawToken)
    const invite = await db.client.invite.create({
        data: {
            tenantId,
            email: email.toLowerCase(),
            role,
            tokenHash,
            invitedById,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    })
    return { invite, token: rawToken }
}

// Never return password hash or token version externally.
interface TUserOut {
    id: string
    tenantId: string
    email: string
    phone: string | null
    role: Role
    firstName: string
    lastName: string
    avatarUrl: string | null
    status: UserStatus
}

export const sanitize = (u: {
    id: string
    tenantId: string
    email: string
    phone: string | null
    role: Role
    firstName: string
    lastName: string
    avatarUrl: string | null
    status: UserStatus
}): TUserOut => ({
    id: u.id,
    tenantId: u.tenantId,
    email: u.email,
    phone: u.phone,
    role: u.role,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl,
    status: u.status
})
