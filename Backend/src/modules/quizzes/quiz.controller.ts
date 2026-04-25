import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './quiz.service'
import { Role } from '@prisma/client'
import { writeAudit } from '../../util/audit'

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const quiz = await service.createQuiz(req.auth.tenantId, req.body, { id: req.auth.userId, role: req.auth.role })
    await writeAudit({ action: 'quiz.create', entityType: 'Quiz', entityId: quiz.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, quiz)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const quiz = await service.updateQuiz(req.auth.tenantId, req.params.id, req.body, {
        id: req.auth.userId,
        role: req.auth.role
    })
    httpResponse(req, res, 200, responseMessage.SUCCESS, quiz)
}

export const remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.deleteQuiz(req.auth.tenantId, req.params.id, { id: req.auth.userId, role: req.auth.role })
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const authorRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER]
    const isAuthor = authorRoles.includes(req.auth.role)
    const quiz = isAuthor
        ? await service.getQuizFull(req.auth.tenantId, req.params.id)
        : await service.getQuizForStudent(req.auth.tenantId, req.auth.userId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, quiz)
}

export const startAttempt = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.startAttempt(req.auth.tenantId, req.auth.userId, req.params.id)
    httpResponse(req, res, 201, responseMessage.CREATED, result)
}

export const submitAttempt = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.submitAttempt(req.auth.tenantId, req.auth.userId, req.params.attemptId, req.body)
    await writeAudit({ action: 'quiz.submit', entityType: 'QuizAttempt', entityId: result.id, metadata: { percent: result.percent } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const myAttempts = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listMyAttempts(req.auth.tenantId, req.auth.userId, req.query.quizId as string | undefined)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}
