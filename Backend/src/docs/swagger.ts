import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import openapi from './openapi'

const router = Router()

// Serve raw spec so external tools (Postman, Insomnia, Redoc) can consume it.
router.get('/openapi.json', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.status(200).json(openapi)
})

// Swagger UI at /api/v1/docs.
router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
        customSiteTitle: 'LearnHub API — Phase 1',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            tryItOutEnabled: true,
            docExpansion: 'list',
            defaultModelsExpandDepth: -1
        }
    })
)

export default router
