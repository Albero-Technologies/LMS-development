import { NextFunction, Request, Response, Router } from 'express'
import multer from 'multer'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth } from '../../middleware/auth'
import { upload } from '../../middleware/upload'
import { uploadMany, uploadSingle } from './upload.controller'
import AppError from '../../util/AppError'

const router = Router()

router.use(requireAuth)

// Translate multer's limit/validation errors into our AppError shape.
const withMulter = (mw: ReturnType<typeof upload>) => (req: Request, res: Response, next: NextFunction): void => {
    mw(req, res, (err: unknown) => {
        if (!err) return next()
        if (err instanceof multer.MulterError) {
            const map: Record<string, { code: string; msg: string; status: number }> = {
                LIMIT_FILE_SIZE:   { code: 'UPLOAD_TOO_LARGE',     msg: 'File too large', status: 413 },
                LIMIT_FILE_COUNT:  { code: 'UPLOAD_TOO_MANY',      msg: 'Too many files', status: 400 },
                LIMIT_UNEXPECTED_FILE: { code: 'UPLOAD_UNEXPECTED', msg: 'Unexpected field', status: 400 }
            }
            const m = map[err.code] ?? { code: 'UPLOAD_ERROR', msg: err.message, status: 400 }
            return next(new AppError(m.status, m.msg, m.code))
        }
        next(err)
    })
}

// Avatar — 2MB image, single file, field name "file"
router.post(
    '/avatars',
    withMulter(upload({ kind: 'avatars', mime: 'image', maxBytes: 2 * 1024 * 1024 })),
    asyncHandler(uploadSingle)
)

// Course thumbnail — 5MB image
router.post(
    '/course-thumbnails',
    withMulter(upload({ kind: 'course-thumbnails', mime: 'image', maxBytes: 5 * 1024 * 1024 })),
    asyncHandler(uploadSingle)
)

// Tenant branding (logo) — 2MB image
router.post(
    '/branding',
    withMulter(upload({ kind: 'branding', mime: 'image', maxBytes: 2 * 1024 * 1024 })),
    asyncHandler(uploadSingle)
)

// Ticket attachments — up to 5 docs/images, 10MB each
router.post(
    '/ticket-attachments',
    withMulter(upload({ kind: 'ticket-attachments', mime: 'any', maxBytes: 10 * 1024 * 1024, maxCount: 5, field: 'files' })),
    asyncHandler(uploadMany)
)

// Assignment submissions (P2 placeholder — auth gate already in place)
router.post(
    '/assignments',
    withMulter(upload({ kind: 'assignments', mime: 'doc', maxBytes: 25 * 1024 * 1024, field: 'file' })),
    asyncHandler(uploadSingle)
)

export default router
