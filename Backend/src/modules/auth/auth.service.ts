import { AuthProvider, InviteStatus, Role, UserStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { comparePassword, hashPassword } from '../../util/password'
import { hashToken, randomToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../util/tokens'
import config from '../../config/config'
import { OAuth2Client } from 'google-auth-library'
import { TAcceptInviteInput, TGoogleCodeInput, TLoginInput, TRegisterInput } from './auth.schema'
import { authLimiter } from '../../config/rateLimiter'
import { writeAudit } from '../../util/audit'
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'
import type { Request } from 'express'

const googleClient = () =>
    new OAuth2Client({
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        redirectUri: config.GOOGLE_REDIRECT_URI
    })

type TTokenBundle = { accessToken: string; refreshToken: string }

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

    const tokens = await issueTokens(user, { ipAddress: req.ip, userAgent: req.headers['user-agent'] as string | undefined })
    return { user: sanitize(user), ...tokens }
}

export const login = async (input: TLoginInput, req: Request) => {
    // Throttle by email — 5 failed per 15 min.
    const key = `login:${input.email.toLowerCase()}`
    if (authLimiter) {
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

    if (!user || !user.passwordHash) {
        throw AppError.unauthorized(responseMessage.INVALID_CREDENTIALS, 'INVALID_CREDENTIALS')
    }
    if (user.status === UserStatus.SUSPENDED) throw AppError.forbidden(responseMessage.ACCOUNT_SUSPENDED, 'SUSPENDED')

    const ok = await comparePassword(input.password, user.passwordHash)
    if (!ok) throw AppError.unauthorized(responseMessage.INVALID_CREDENTIALS, 'INVALID_CREDENTIALS')

    // Reset throttle on success.
    if (authLimiter) await authLimiter.delete(key).catch(() => void 0)

    await db.client.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    await writeAudit({ action: 'auth.login', entityType: 'User', entityId: user.id, tenantId: user.tenantId, userId: user.id }, req)

    const tokens = await issueTokens(user, { ipAddress: req.ip, userAgent: req.headers['user-agent'] as string | undefined })
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
    const tokens = await issueTokens(user, { ipAddress: req.ip, userAgent: req.headers['user-agent'] as string | undefined })
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

export const googleAuthUrl = (tenantSlug?: string): string => {
    const client = googleClient()
    const state = tenantSlug ? Buffer.from(JSON.stringify({ tenantSlug })).toString('base64url') : undefined
    return client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['openid', 'email', 'profile'],
        state
    })
}

export const googleCallback = async (input: TGoogleCodeInput, req: Request) => {
    if (!config.GOOGLE_CLIENT_ID) throw AppError.badRequest('Google OAuth not configured', 'GOOGLE_DISABLED')

    const client = googleClient()
    const { tokens } = await client.getToken(input.code).catch(() => {
        throw AppError.badRequest('Failed to exchange Google code', 'GOOGLE_CODE_INVALID')
    })
    if (!tokens.id_token) throw AppError.badRequest('Google did not return id_token', 'GOOGLE_NO_ID_TOKEN')

    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: config.GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    if (!payload?.email) throw AppError.badRequest('Google profile missing email', 'GOOGLE_NO_EMAIL')

    let tenantSlug: string | undefined
    if (input.state) {
        try {
            const parsed = JSON.parse(Buffer.from(input.state, 'base64url').toString('utf8'))
            tenantSlug = parsed.tenantSlug
        } catch {
            /* ignore */
        }
    }

    const tenant = tenantSlug ? await findTenantBySlug(tenantSlug) : null

    // Prefer match by googleSub → email within tenant → create new student in tenant.
    let user = await db.client.user.findFirst({ where: { googleSub: payload.sub, deletedAt: null } })
    if (!user && tenant) {
        user = await db.client.user.findUnique({
            where: { tenantId_email: { tenantId: tenant.id, email: payload.email.toLowerCase() } }
        })
        if (user && !user.googleSub) {
            user = await db.client.user.update({
                where: { id: user.id },
                data: { googleSub: payload.sub, provider: AuthProvider.GOOGLE, emailVerified: true }
            })
        }
    }
    if (!user) {
        if (!tenant) throw AppError.badRequest('tenantSlug is required for first-time Google sign-in', 'TENANT_REQUIRED')
        user = await db.client.user.create({
            data: {
                tenantId: tenant.id,
                email: payload.email.toLowerCase(),
                googleSub: payload.sub,
                provider: AuthProvider.GOOGLE,
                firstName: payload.given_name || 'User',
                lastName: payload.family_name || '',
                avatarUrl: payload.picture,
                role: Role.STUDENT,
                emailVerified: true,
                status: UserStatus.ACTIVE
            }
        })
        await notifyQueue.add(NOTIFY_JOB, {
            tenantId: tenant.id,
            userId: user.id,
            template: 'welcome',
            data: { firstName: user.firstName }
        })
    }

    await db.client.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    await writeAudit(
        { action: 'auth.google_login', entityType: 'User', entityId: user.id, tenantId: user.tenantId, userId: user.id },
        req
    )

    const bundle = await issueTokens(user, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string | undefined
    })
    return { user: sanitize(user), ...bundle }
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
    await writeAudit(
        { action: 'auth.invite_accepted', entityType: 'User', entityId: user.id, tenantId: user.tenantId, userId: user.id },
        req
    )

    const bundle = await issueTokens(user, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string | undefined
    })
    return { user: sanitize(user), ...bundle }
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
type TUserOut = {
    id: string
    tenantId: string
    email: string
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
    role: Role
    firstName: string
    lastName: string
    avatarUrl: string | null
    status: UserStatus
}): TUserOut => ({
    id: u.id,
    tenantId: u.tenantId,
    email: u.email,
    role: u.role,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl,
    status: u.status
})
