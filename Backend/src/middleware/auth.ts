import { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../util/tokens'
import db from '../service/db'
import AppError from '../util/AppError'
import responseMessage from '../constant/responseMessage'
import httpError from '../util/httpError'
import { Role, UserStatus } from '@prisma/client'
import { can, TAction, TModule } from '../constant/policy'

const extractBearer = (req: Request): string | null => {
    const header = req.headers.authorization
    if (header && header.startsWith('Bearer ')) return header.slice(7)
    // Optional cookie fallback for same-site web clients
    const cookieToken = (req as unknown as { cookies?: { access_token?: string } }).cookies?.access_token
    return cookieToken || null
}

// Attaches req.auth — throws 401 on any failure.
export const requireAuth = async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    try {
        const token = extractBearer(req)
        if (!token) throw AppError.unauthorized(responseMessage.UNAUTHORIZED, 'NO_TOKEN')

        let decoded
        try {
            decoded = verifyAccessToken(token)
        } catch {
            throw AppError.unauthorized(responseMessage.INVALID_TOKEN, 'INVALID_TOKEN')
        }

        // Load minimal user state — validates tenant membership + token version.
        const user = await db.client.user.findFirst({
            where: { id: decoded.sub, tenantId: decoded.tid, deletedAt: null },
            select: { id: true, tenantId: true, role: true, email: true, tokenVersion: true, status: true }
        })
        if (!user) throw AppError.unauthorized(responseMessage.UNAUTHORIZED, 'USER_NOT_FOUND')
        if (user.status === UserStatus.SUSPENDED) throw AppError.forbidden(responseMessage.ACCOUNT_SUSPENDED, 'SUSPENDED')
        if (user.tokenVersion !== decoded.ver) throw AppError.unauthorized(responseMessage.INVALID_TOKEN, 'TOKEN_STALE')

        req.auth = {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            email: user.email,
            tokenVersion: user.tokenVersion
        }
        next()
    } catch (err) {
        httpError(next, err, req, err instanceof AppError ? err.statusCode : 401)
    }
}

// Role gate — used for admin-only endpoints.
export const requireRole = (...roles: Role[]) => {
    return (req: Request, _: Response, next: NextFunction): void => {
        try {
            if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
            if (!roles.includes(req.auth.role)) throw AppError.forbidden(responseMessage.FORBIDDEN, 'ROLE_FORBIDDEN')
            next()
        } catch (err) {
            httpError(next, err, req, err instanceof AppError ? err.statusCode : 403)
        }
    }
}

// Module × action RBAC gate (POLICY table).
export const requirePolicy = (module: TModule, action: TAction) => {
    return (req: Request, _: Response, next: NextFunction): void => {
        try {
            if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
            if (!can(req.auth.role, module, action)) {
                throw AppError.forbidden(responseMessage.FORBIDDEN, 'POLICY_DENIED')
            }
            next()
        } catch (err) {
            httpError(next, err, req, err instanceof AppError ? err.statusCode : 403)
        }
    }
}

// Assert a row belongs to the caller's tenant — used in controllers after fetching a resource.
export const assertSameTenant = (req: Request, row: { tenantId: string } | null | undefined): void => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
    if (!row) throw AppError.notFound(responseMessage.NOT_FOUND('resource'))
    if (row.tenantId !== req.auth.tenantId) {
        throw AppError.forbidden(responseMessage.CROSS_TENANT_DENIED, 'CROSS_TENANT')
    }
}
