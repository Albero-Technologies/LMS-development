import { type Request, type Response } from 'express'
import { Role } from '@prisma/client'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import AppError from '../../util/AppError'
import db from '../../service/db'
import { writeAudit } from '../../util/audit'
import * as service from './cms.service'

// SUPER_ADMIN can target any tenant via `?tenantId=...`. Useful when the SA
// account lives in the platform tenant (slug `platform`) and needs to manage
// content for a customer tenant (e.g. albero-academy). Other roles always
// read their own JWT tenant — the override is silently ignored. We also
// validate that the tenant exists, so a stray UUID just 404s instead of
// silently writing items into nowhere.
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

// ---- Collections ----------------------------------------------------------

export const listCollections = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const rows = await service.listCollections(tenantId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const getCollection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const collection = await service.getCollection(tenantId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, collection)
}

export const createCollection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const collection = await service.createCollection(tenantId, req.body)
    await writeAudit({ action: 'cms.collection.create', entityType: 'Collection', entityId: collection.id, tenantId }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, collection)
}

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const collection = await service.updateCollection(tenantId, req.params.id, req.body)
    await writeAudit({ action: 'cms.collection.update', entityType: 'Collection', entityId: collection.id, tenantId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, collection)
}

export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const collection = await service.deleteCollection(tenantId, req.params.id)
    await writeAudit({ action: 'cms.collection.delete', entityType: 'Collection', entityId: collection.id, tenantId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, collection)
}

// ---- Items ---------------------------------------------------------------

export const listItems = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const publishedOnly = req.query.published === 'true'
    const items = await service.listItems(tenantId, req.params.id, { publishedOnly })
    httpResponse(req, res, 200, responseMessage.SUCCESS, items)
}

export const getItem = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const { item } = await service.getItem(tenantId, req.params.id, req.params.itemId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, item)
}

export const createItem = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const item = await service.createItem(tenantId, req.params.id, req.body)
    await writeAudit({ action: 'cms.item.create', entityType: 'CollectionItem', entityId: item.id, tenantId }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, item)
}

export const updateItem = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const item = await service.updateItem(tenantId, req.params.id, req.params.itemId, req.body)
    await writeAudit({ action: 'cms.item.update', entityType: 'CollectionItem', entityId: item.id, tenantId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, item)
}

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const item = await service.deleteItem(tenantId, req.params.id, req.params.itemId)
    await writeAudit({ action: 'cms.item.delete', entityType: 'CollectionItem', entityId: item.id, tenantId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, item)
}
