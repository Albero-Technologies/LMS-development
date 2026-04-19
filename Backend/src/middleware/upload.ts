import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import multer, { FileFilterCallback } from 'multer'
import { Request } from 'express'
import AppError from '../util/AppError'

// Local-disk storage — Phase 1 only. Phase 3+ swaps this for S3 multipart
// (PRD 13.5). We keep the interface identical so callers don't change.
const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'public', 'uploads')

const ensureDir = (dir: string): void => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

ensureDir(UPLOAD_ROOT)

// Per-tenant, per-kind subdirectories keep a tenant's files off a shared path.
const subdirFor = (req: Request, kind: string): string => {
    const tenantId = req.auth?.tenantId ?? 'anonymous'
    const dir = path.join(UPLOAD_ROOT, kind, tenantId)
    ensureDir(dir)
    return dir
}

const safeFilename = (original: string): string => {
    const ext = path.extname(original).toLowerCase().slice(0, 10) // cap ext length
    const base = crypto.randomBytes(16).toString('hex')
    return `${Date.now()}-${base}${ext}`
}

// Broad allowlists — tighten per-route if needed.
const IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
const DOC_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain'
])

type TUploadKind = 'avatars' | 'course-thumbnails' | 'assignments' | 'branding' | 'ticket-attachments'

type TUploadOpts = {
    kind: TUploadKind
    /** Max size in bytes. Default 10MB. */
    maxBytes?: number
    /** Which MIME families are allowed. Default 'image'. */
    mime?: 'image' | 'doc' | 'any'
    /** Multer field name (for .single / .array). */
    field?: string
    /** Allow array uploads with this max count. Defaults to single-file mode. */
    maxCount?: number
}

const fileFilter = (allow: 'image' | 'doc' | 'any') => {
    return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
        if (allow === 'any') return cb(null, true)
        const set = allow === 'image' ? IMAGE_MIME : DOC_MIME
        if (set.has(file.mimetype)) return cb(null, true)
        cb(AppError.badRequest(`Unsupported file type: ${file.mimetype}`, 'UPLOAD_BAD_MIME'))
    }
}

// Build a multer handler scoped to a kind. Returns an Express middleware that
// parses multipart, writes files to disk, and attaches them to req.file(s).
export const upload = (opts: TUploadOpts) => {
    const maxBytes = opts.maxBytes ?? 10 * 1024 * 1024
    const field = opts.field ?? 'file'

    const storage = multer.diskStorage({
        destination: (req, _file, cb) => cb(null, subdirFor(req as Request, opts.kind)),
        filename: (_req, file, cb) => cb(null, safeFilename(file.originalname))
    })

    const instance = multer({
        storage,
        limits: { fileSize: maxBytes, files: opts.maxCount ?? 1 },
        fileFilter: fileFilter(opts.mime ?? 'image')
    })

    return opts.maxCount && opts.maxCount > 1
        ? instance.array(field, opts.maxCount)
        : instance.single(field)
}

// Convert an absolute disk path back into a publicly-servable URL.
// Nginx serves /uploads/ directly from the same on-disk folder (see nginx/http.conf).
export const publicUrlFor = (absoluteOrRelative: string): string => {
    const rel = path.relative(path.join(__dirname, '..', '..', 'public'), absoluteOrRelative)
    const normalised = rel.split(path.sep).join('/')
    return `/${normalised}`
}
