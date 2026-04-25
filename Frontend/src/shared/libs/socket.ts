import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@shared/stores/authStore'

// Singleton socket connection. Connects lazily on first ensureSocket() call,
// reconnects when the access token rotates, and disconnects on logout.
//
// Backend mounts socket.io at /api/v1/socket.io (see Backend/src/service/socket.ts).
// In dev, Vite proxies /api → backend so the same path works without CORS.

let socket: Socket | null = null
let currentToken: string | null = null

const PATH = '/api/v1/socket.io'

const buildSocket = (token: string): Socket => {
    return io({
        path: PATH,
        // Same-origin in dev (Vite proxy) and prod (Netlify rewrite via VITE_API_BASE_URL
        // when configured); allow cookie-based auth as a fallback alongside the token.
        withCredentials: true,
        auth: { token },
        // Don't try to connect anonymously — the backend will reject anyway.
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1_500
    })
}

export const ensureSocket = (): Socket | null => {
    const { accessToken } = useAuthStore.getState()
    if (!accessToken) {
        if (socket) {
            socket.disconnect()
            socket = null
            currentToken = null
        }
        return null
    }

    // Token rotated since the last connect — drop and reconnect with the new one.
    if (socket && currentToken !== accessToken) {
        socket.disconnect()
        socket = null
    }

    if (!socket) {
        socket = buildSocket(accessToken)
        currentToken = accessToken
    }

    return socket
}

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect()
        socket = null
        currentToken = null
    }
}

// Subscribe to an event and get back an unsubscribe fn. Safe to call before
// the connection is up — the listener will be ready when events arrive.
export const onSocketEvent = <T = unknown>(event: string, handler: (payload: T) => void): (() => void) => {
    const s = ensureSocket()
    if (!s) return () => undefined
    s.on(event, handler as (...args: unknown[]) => void)
    return () => {
        s.off(event, handler as (...args: unknown[]) => void)
    }
}
