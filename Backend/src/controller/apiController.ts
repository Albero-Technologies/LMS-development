import { type NextFunction, type Request, type Response } from 'express'
import httpResponse from '../util/httpResponse'
import responseMessage from '../constant/responseMessage'
import httpError from '../util/httpError'
import quicker from '../util/quicker'
import db from '../service/db'
import { registry } from '../service/metrics'

export default {
    self: (req: Request, res: Response, next: NextFunction) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                service: 'learnhub-api',
                version: '1.0.0',
                auth: req.auth ?? null
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    health: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // DB liveness probe.
            let dbHealthy = false
            try {
                await db.client.$queryRaw`SELECT 1`
                dbHealthy = true
            } catch {
                /* ignore */
            }

            const healthData = {
                application: quicker.getApplicationHealth(),
                system: quicker.getSystemHealth(),
                db: dbHealthy ? 'up' : 'down',
                timestamp: Date.now()
            }

            httpResponse(req, res, dbHealthy ? 200 : 503, responseMessage.SUCCESS, healthData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    metrics: async (_req: Request, res: Response, next: NextFunction) => {
        try {
            // Prometheus text exposition from prom-client registry.
            // Includes default Node metrics (heap, CPU, GC, event-loop lag)
            // + custom RED metrics for HTTP + domain counters.
            res.setHeader('Content-Type', registry.contentType)
            res.status(200).send(await registry.metrics())
        } catch (err) {
            next(err)
        }
    }
}
