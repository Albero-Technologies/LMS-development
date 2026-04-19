import { NextFunction, Request, Response } from 'express'
import { httpRequestDuration, httpRequestsInFlight, httpRequestsTotal } from '../service/metrics'

// Express 5 exposes req.route.path only AFTER the route handler runs, so we
// capture it on response finish. For unmatched routes we emit "unmatched"
// rather than the raw URL to keep cardinality bounded.
const labelRoute = (req: Request): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const route = (req as any).route?.path as string | undefined
    if (route) {
        // Combine mountpath + route (e.g. "/api/v1" + "/courses/:id").
        const mount = (req.baseUrl || '').replace(/\/+$/, '')
        return `${mount}${route}` || '/'
    }
    // Scrub numeric/UUID segments so /does/not/exist/abc-123 still collapses.
    return req.path
        .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi, '/:uuid')
        .replace(/\/\d+(?=\/|$)/g, '/:id') || '/'
}

export default (req: Request, res: Response, next: NextFunction): void => {
    // Skip the metrics endpoint itself to avoid recursive noise.
    if (req.path === '/api/v1/metrics' || req.path === '/metrics') return next()

    const method = req.method.toUpperCase()
    httpRequestsInFlight.inc({ method })

    const endTimer = httpRequestDuration.startTimer()

    res.on('finish', () => {
        const route = labelRoute(req)
        const status = String(res.statusCode)
        httpRequestsTotal.inc({ method, route, status_code: status })
        endTimer({ method, route, status_code: status })
        httpRequestsInFlight.dec({ method })
    })

    res.on('close', () => {
        // Safety net: if the client aborted and 'finish' never fires, still
        // decrement the in-flight gauge so we don't leak.
        if (!res.writableEnded) httpRequestsInFlight.dec({ method })
    })

    next()
}
