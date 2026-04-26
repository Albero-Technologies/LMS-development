import { type Request, type Response } from 'express'
import * as service from './seo.service'

// Public sitemap.xml — no auth, no envelope, raw XML body. Cached for 1h on
// the wire so bots don't hammer the DB.
export const getTenantSitemap = async (req: Request, res: Response): Promise<void> => {
    const { sitemap, contentType } = await service.buildTenantSitemap(req.params.slug)
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(sitemap)
}

// Public robots.txt — same shape, plain text.
export const getTenantRobots = async (req: Request, res: Response): Promise<void> => {
    const { robots, contentType } = await service.buildTenantRobots(req.params.slug)
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(robots)
}
