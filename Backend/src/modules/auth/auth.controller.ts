import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import config from '../../config/config'
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

export const me = (req: Request, res: Response): void => {
    httpResponse(req, res, 200, responseMessage.SUCCESS, { user: req.auth })
}

export const googleStart = (req: Request, res: Response): void => {
    const tenantSlug = (req.query.tenantSlug as string) || undefined
    const url = service.googleAuthUrl(tenantSlug)
    res.redirect(url)
}

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
    const code = (req.query.code as string) || (req.body as { code?: string })?.code
    const state = (req.query.state as string) || (req.body as { state?: string })?.state
    if (!code) {
        httpResponse(req, res, 400, 'Missing authorization code')
        return
    }
    const result = await service.googleCallback({ code, state }, req)
    setRefreshCookie(res, result.refreshToken)

    if (config.GOOGLE_POST_LOGIN_REDIRECT) {
        const sep = config.GOOGLE_POST_LOGIN_REDIRECT.includes('?') ? '&' : '?'
        res.redirect(`${config.GOOGLE_POST_LOGIN_REDIRECT}${sep}accessToken=${encodeURIComponent(result.accessToken)}`)
        return
    }
    httpResponse(req, res, 200, responseMessage.SUCCESS, { user: result.user, accessToken: result.accessToken })
}

export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
    const result = await service.acceptInvite(req.body, req)
    setRefreshCookie(res, result.refreshToken)
    httpResponse(req, res, 200, responseMessage.SUCCESS, { user: result.user, accessToken: result.accessToken })
}
