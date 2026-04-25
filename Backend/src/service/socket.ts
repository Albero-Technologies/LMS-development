import { Server as IoServer, type Socket } from 'socket.io'
import { type Server as HttpServer } from 'http'
import config from '../config/config'
import logger from '../util/logger'
import { verifyAccessToken } from '../util/tokens'

// Socket.io layer for real-time push (§7.2). Each authenticated user joins:
//   - user:{userId}    → personal events (notifications, ticket replies you own)
//   - tenant:{tenantId} → tenant-wide broadcasts (admin announcements, etc.)
// Auth happens during the handshake so we never accept anonymous connections.

let io: IoServer | null = null

interface TAuthData {
    userId: string
    tenantId: string
    role: string
}

interface TSocketWithAuth extends Socket {
    data: { auth: TAuthData }
}

export const initSocket = (httpServer: HttpServer): IoServer => {
    if (io) return io

    const corsOrigins = [config.CORS_ORIGIN, ...config.ALLOWED_TENANT_ORIGINS].filter(Boolean)

    io = new IoServer(httpServer, {
        path: '/api/v1/socket.io',
        cors: {
            origin: corsOrigins,
            credentials: true
        },
        // Heartbeat tuning: keep the connection alive across hops, but cut dead ones quickly.
        pingInterval: 25_000,
        pingTimeout: 20_000
    })

    // Auth middleware — runs once per connection. Reject if the token is missing or invalid.
    io.use((socket, next) => {
        try {
            // Token can come from auth payload OR from the cookie header (matching the HTTP API).
            const tokenFromAuth = (socket.handshake.auth as { token?: string } | undefined)?.token
            const cookies = socket.handshake.headers.cookie ?? ''
            const tokenFromCookie = /access_token=([^;]+)/.exec(cookies)?.[1]
            const token = tokenFromAuth ?? tokenFromCookie
            if (!token) return next(new Error('NO_TOKEN'))

            const payload = verifyAccessToken(token)
            ;(socket as TSocketWithAuth).data.auth = {
                userId: payload.sub,
                tenantId: payload.tid,
                role: String(payload.role)
            }
            next()
        } catch {
            next(new Error('INVALID_TOKEN'))
        }
    })

    io.on('connection', (socket) => {
        const auth = (socket as TSocketWithAuth).data.auth
        void socket.join(`user:${auth.userId}`)
        void socket.join(`tenant:${auth.tenantId}`)
        logger.debug('SOCKET_CONNECTED', { meta: { userId: auth.userId, tenantId: auth.tenantId } })

        socket.on('disconnect', (reason) => {
            logger.debug('SOCKET_DISCONNECTED', { meta: { userId: auth.userId, reason } })
        })
    })

    logger.info('SOCKET_IO_INITIALIZED')
    return io
}

export const getIo = (): IoServer | null => io

// Fire-and-forget emit helpers. Returns false if the socket layer isn't up
// yet (e.g. during boot) — callers should never depend on the emit landing.
export const emitToUser = (userId: string, event: string, payload: unknown): boolean => {
    if (!io) return false
    io.to(`user:${userId}`).emit(event, payload)
    return true
}

export const emitToTenant = (tenantId: string, event: string, payload: unknown): boolean => {
    if (!io) return false
    io.to(`tenant:${tenantId}`).emit(event, payload)
    return true
}

export const closeSocket = async (): Promise<void> => {
    if (!io) return
    await io.close()
    io = null
}
