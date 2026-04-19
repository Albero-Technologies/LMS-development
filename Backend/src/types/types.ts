import { Role } from '@prisma/client'

export type THttpResponse = {
    success: boolean
    statusCode: number
    request: {
        ip?: string | null
        method: string
        url: string
    }
    message: string
    data: unknown
}

export type THttpErrror = {
    success: boolean
    statusCode: number
    code: string
    request: {
        ip?: string | null
        method: string
        url: string
    }
    message: string
    data: unknown
    details?: unknown
    trace?: object | null
}

// Attached to the Express request by auth middleware.
export type TAuthContext = {
    userId: string
    tenantId: string
    role: Role
    email: string
    tokenVersion: number
}

// Token payload packed into the signed JWT.
export type TJwtPayload = {
    sub: string
    tid: string
    role: Role
    ver: number
    typ: 'access' | 'refresh'
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            auth?: TAuthContext
            requestId?: string
        }
    }
}

export {}
