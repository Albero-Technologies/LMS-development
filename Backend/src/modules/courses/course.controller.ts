import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './course.service'
import { Role } from '@prisma/client'
import { writeAudit } from '../../util/audit'

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.listCourses(req.auth.tenantId, req.auth.role, req.auth.userId, req.query as never)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const privileged: Role[] = [Role.ADMIN, Role.SUPER_ADMIN, Role.TRAINER]
    const includePrivate = privileged.includes(req.auth.role)
    const course = await service.getCourse(req.auth.tenantId, req.params.id, { includePrivate })
    httpResponse(req, res, 200, responseMessage.SUCCESS, course)
}

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const course = await service.createCourse(req.auth.tenantId, req.body, req.auth.userId, req.auth.role)
    await writeAudit({ action: 'course.create', entityType: 'Course', entityId: course.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, course)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const course = await service.updateCourse(req.auth.tenantId, req.params.id, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    await writeAudit({ action: 'course.update', entityType: 'Course', entityId: course.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, course)
}

export const remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.deleteCourse(req.auth.tenantId, req.params.id)
    await writeAudit({ action: 'course.delete', entityType: 'Course', entityId: req.params.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const addSection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const section = await service.addSection(req.auth.tenantId, req.params.id, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 201, responseMessage.CREATED, section)
}

export const deleteSection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.deleteSection(req.auth.tenantId, req.params.id, req.params.sectionId, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const addLesson = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const lesson = await service.addLesson(req.auth.tenantId, req.params.id, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 201, responseMessage.CREATED, lesson)
}

export const updateLesson = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const lesson = await service.updateLesson(req.auth.tenantId, req.params.id, req.params.lessonId, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 200, responseMessage.SUCCESS, lesson)
}

export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.deleteLesson(req.auth.tenantId, req.params.id, req.params.lessonId, {
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
