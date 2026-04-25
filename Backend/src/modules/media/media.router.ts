import { type NextFunction, type Request, type Response, Router } from 'express'
import multer from 'multer'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requireRole } from '../../middleware/auth'
import { upload } from '../../middleware/upload'
import * as ctrl from './media.controller'
import AppError from '../../util/AppError'
import { Role } from '@prisma/client'

const router = Router()

router.use(requireAuth)

// Translate multer errors into AppError so the global handler returns the
// right shape. Mirrors what upload.router does for the per-domain endpoints.
const withMulter =
    (mw: ReturnType<typeof upload>) =>
    (req: Request, res: Response, next: NextFunction): void => {
        mw(req, res, (err: unknown) => {
            if (!err) return next()
            if (err instanceof multer.MulterError) {
                const map: Record<string, { code: string; msg: string; status: number }> = {
                    LIMIT_FILE_SIZE: { code: 'UPLOAD_TOO_LARGE', msg: 'File too large', status: 413 },
                    LIMIT_FILE_COUNT: { code: 'UPLOAD_TOO_MANY', msg: 'Too many files', status: 400 },
                    LIMIT_UNEXPECTED_FILE: { code: 'UPLOAD_UNEXPECTED', msg: 'Unexpected field', status: 400 }
                }
                const m = map[err.code] ?? { code: 'UPLOAD_ERROR', msg: err.message, status: 400 }
                return next(new AppError(m.status, m.msg, m.code))
            }
            next(err)
        })
    }

// Media library — restricted to roles that own the website editor. Tenants
// shouldn't be able to dump arbitrary files into the platform via the
// student app. 10MB cap; allow images only for now (videos can land later).
router.post(
    '/upload',
    requireRole(Role.ADMIN, Role.SUPER_ADMIN),
    withMulter(upload({ kind: 'media', mime: 'image', maxBytes: 10 * 1024 * 1024 })),
    asyncHandler(ctrl.upload)
)

router.get('/', requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.TRAINER), asyncHandler(ctrl.list))
router.delete('/:id', requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.remove))

export default router
