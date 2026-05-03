import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './course.service'
import { Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import { writeAudit } from '../../util/audit'

// SUPER_ADMIN can target any tenant by passing `?tenantId=<uuid>` (cross-
// tenant course management — same pattern as the CMS controller). Other
// roles silently ignore the override and stay on their JWT tenant. The
// override is validated against the tenants table so a stray UUID 404s
// instead of writing to nowhere.
const resolveTenantId = async (req: Request): Promise<string> => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED, 'NO_AUTH')
    const override = typeof req.query.tenantId === 'string' ? req.query.tenantId.trim() : ''
    if (override && req.auth.role === Role.SUPER_ADMIN) {
        const exists = await db.client.tenant.findUnique({ where: { id: override }, select: { id: true } })
        if (!exists) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
        return override
    }
    return req.auth.tenantId
}

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.listCourses(req.auth.tenantId, req.auth.role, req.auth.userId, req.query as never)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const privileged: Role[] = [Role.ADMIN, Role.SUPER_ADMIN, Role.TRAINER]
    const includePrivate = privileged.includes(req.auth.role)
    const course = await service.getCourse(tenantId, req.params.id, { includePrivate })
    httpResponse(req, res, 200, responseMessage.SUCCESS, course)
}

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const course = await service.createCourse(tenantId, req.body, req.auth.userId, req.auth.role)
    await writeAudit({ action: 'course.create', entityType: 'Course', entityId: course.id, tenantId }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, course)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const course = await service.updateCourse(tenantId, req.params.id, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    await writeAudit({ action: 'course.update', entityType: 'Course', entityId: course.id, tenantId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, course)
}

export const remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    await service.deleteCourse(tenantId, req.params.id)
    await writeAudit({ action: 'course.delete', entityType: 'Course', entityId: req.params.id, tenantId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const addSection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const section = await service.addSection(tenantId, req.params.id, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 201, responseMessage.CREATED, section)
}

export const updateSection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const section = await service.updateSection(tenantId, req.params.id, req.params.sectionId, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 200, responseMessage.SUCCESS, section)
}

export const deleteSection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    await service.deleteSection(tenantId, req.params.id, req.params.sectionId, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const addLesson = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const lesson = await service.addLesson(tenantId, req.params.id, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 201, responseMessage.CREATED, lesson)
}

export const updateLesson = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const lesson = await service.updateLesson(tenantId, req.params.id, req.params.lessonId, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 200, responseMessage.SUCCESS, lesson)
}

export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    await service.deleteLesson(tenantId, req.params.id, req.params.lessonId, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const updateProgress = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.updateProgress(req.auth.tenantId, req.auth.userId, req.params.id, req.params.lessonId, req.body)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}
