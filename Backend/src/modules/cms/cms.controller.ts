import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import { writeAudit } from '../../util/audit'
import * as service from './cms.service'

// ---- Collections ----------------------------------------------------------

export const listCollections = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listCollections(req.auth.tenantId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const getCollection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const collection = await service.getCollection(req.auth.tenantId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, collection)
}

export const createCollection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const collection = await service.createCollection(req.auth.tenantId, req.body)
    await writeAudit({ action: 'cms.collection.create', entityType: 'Collection', entityId: collection.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, collection)
}

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const collection = await service.updateCollection(req.auth.tenantId, req.params.id, req.body)
    await writeAudit({ action: 'cms.collection.update', entityType: 'Collection', entityId: collection.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, collection)
}

export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const collection = await service.deleteCollection(req.auth.tenantId, req.params.id)
    await writeAudit({ action: 'cms.collection.delete', entityType: 'Collection', entityId: collection.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, collection)
}

// ---- Items ---------------------------------------------------------------

export const listItems = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const publishedOnly = req.query.published === 'true'
    const items = await service.listItems(req.auth.tenantId, req.params.id, { publishedOnly })
    httpResponse(req, res, 200, responseMessage.SUCCESS, items)
}

export const getItem = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const { item } = await service.getItem(req.auth.tenantId, req.params.id, req.params.itemId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, item)
}

export const createItem = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const item = await service.createItem(req.auth.tenantId, req.params.id, req.body)
    await writeAudit({ action: 'cms.item.create', entityType: 'CollectionItem', entityId: item.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, item)
}

export const updateItem = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const item = await service.updateItem(req.auth.tenantId, req.params.id, req.params.itemId, req.body)
    await writeAudit({ action: 'cms.item.update', entityType: 'CollectionItem', entityId: item.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, item)
}

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const item = await service.deleteItem(req.auth.tenantId, req.params.id, req.params.itemId)
    await writeAudit({ action: 'cms.item.delete', entityType: 'CollectionItem', entityId: item.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, item)
}
