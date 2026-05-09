import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import config from '../../config/config'
import db from '../../service/db'
import AppError from '../../util/AppError'
import * as service from './auth.service'

const refreshCookieName = 'refresh_token'

const setRefreshCookie = (res: Response, token: string): void => {
    res.cookie(refreshCookieName, token, {
        httpOnly: true,
        secure: config.COOKIE_SECURE,
        sameSite: 'lax',
        domain: config.COOKIE_DOMAIN,
        path: '/api/v1/auth',
        maxAge: config.JWT_REFRESH_TTL_SECONDS * 1000
    })
}

const clearRefreshCookie = (res: Response): void => {
    res.clearCookie(refreshCookieName, { path: '/api/v1/auth', domain: config.COOKIE_DOMAIN })
}

export const register = async (req: Request, res: Response): Promise<void> => {
    const result = await service.register(req.body, req)
    setRefreshCookie(res, result.refreshToken)
    httpResponse(req, res, 201, responseMessage.CREATED, {
        user: result.user,
        accessToken: result.accessToken
    })
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const result = await service.login(req.body, req)
    setRefreshCookie(res, result.refreshToken)
    httpResponse(req, res, 200, responseMessage.SUCCESS, {
        user: result.user,
        accessToken: result.accessToken
    })
}

export const refresh = async (req: Request, res: Response): Promise<void> => {
    const token =
        (req as unknown as { cookies?: { refresh_token?: string } }).cookies?.refresh_token || (req.body as { refreshToken?: string }).refreshToken
    if (!token) {
        httpResponse(req, res, 401, responseMessage.UNAUTHORIZED)
        return
    }
    const result = await service.refresh(token, req)
    setRefreshCookie(res, result.refreshToken)
    httpResponse(req, res, 200, responseMessage.SUCCESS, { user: result.user, accessToken: result.accessToken })
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    const token =
        (req as unknown as { cookies?: { refresh_token?: string } }).cookies?.refresh_token || (req.body as { refreshToken?: string })?.refreshToken
    if (req.auth) {
        await service.logout(token, req.auth.userId)
    }
    clearRefreshCookie(res)
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const me = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
    const user = await db.client.user.findFirst({
        where: { id: req.auth.userId, tenantId: req.auth.tenantId, deletedAt: null },
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
    if (!user) throw AppError.unauthorized(responseMessage.UNAUTHORIZED, 'USER_NOT_FOUND')
    httpResponse(req, res, 200, responseMessage.SUCCESS, { user: service.sanitize(user) })
}

export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
    const result = await service.acceptInvite(req.body, req)
    setRefreshCookie(res, result.refreshToken)
    httpResponse(req, res, 200, responseMessage.SUCCESS, { user: result.user, accessToken: result.accessToken })
}

export const updateMe = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
    const user = await service.updateProfile(req.auth.userId, req.auth.tenantId, req.body, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, { user })
}

export const changeMyPassword = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
    await service.changePassword(req.auth.userId, req.body, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

// Pre-flight check from the set-password page. Doesn't burn the token.
export const verifyPasswordResetToken = async (req: Request, res: Response): Promise<void> => {
    const token = (req.params as { token?: string }).token
    if (!token) throw AppError.badRequest('Missing token', 'TOKEN_MISSING')
    const data = await service.verifyPasswordResetToken(token)
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

// Consume a one-time-token to set a new password. Returns a fresh JWT pair
// so the user lands signed-in immediately on the dashboard.
export const setPasswordWithToken = async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body as { token: string; newPassword: string }
    const result = await service.setPasswordWithToken(token, newPassword, req)
    setRefreshCookie(res, result.refreshToken)
    httpResponse(req, res, 200, responseMessage.SUCCESS, {
        user: result.user,
        accessToken: result.accessToken
    })
}
