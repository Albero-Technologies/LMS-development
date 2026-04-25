import jwt, { type SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'
import config from '../config/config'
import { type TJwtPayload } from '../types/types'
import { type Role } from '@prisma/client'

interface TIssueInput {
    userId: string
    tenantId: string
    role: Role
    tokenVersion: number
}

export const signAccessToken = ({ userId, tenantId, role, tokenVersion }: TIssueInput): string => {
    const payload: TJwtPayload = {
        sub: userId,
        tid: tenantId,
        role,
        ver: tokenVersion,
        typ: 'access'
    }
    const opts: SignOptions = { expiresIn: config.JWT_ACCESS_TTL_SECONDS }
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, opts)
}

export const signRefreshToken = ({ userId, tenantId, role, tokenVersion }: TIssueInput): string => {
    const payload: TJwtPayload = {
        sub: userId,
        tid: tenantId,
        role,
        ver: tokenVersion,
        typ: 'refresh'
    }
    const opts: SignOptions = { expiresIn: config.JWT_REFRESH_TTL_SECONDS }
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, opts)
}

export const verifyAccessToken = (token: string): TJwtPayload => {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as TJwtPayload
    if (decoded.typ !== 'access') throw new Error('Invalid token type')
    return decoded
}

export const verifyRefreshToken = (token: string): TJwtPayload => {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as TJwtPayload
    if (decoded.typ !== 'refresh') throw new Error('Invalid token type')
    return decoded
}

// Store only the sha-256 of refresh tokens server-side, so a DB leak can't resurrect sessions.
export const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex')

export const randomToken = (bytes = 32): string => crypto.randomBytes(bytes).toString('hex')
