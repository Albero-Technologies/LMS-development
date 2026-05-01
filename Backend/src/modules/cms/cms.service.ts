import { type Prisma } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { type TCollectionCreate, type TCollectionUpdate, type TFieldDef, type TItemCreate, type TItemUpdate } from './cms.schema'

// Coerce + validate an item's data blob against the collection's field
// schema. Required fields throw; optional fields default to null. Unknown
// keys are dropped silently so old item rows don't blow up the API after a
// field is removed from the collection schema.
const validateAgainstSchema = (data: Record<string, unknown>, fields: TFieldDef[]): Record<string, unknown> => {
    const out: Record<string, unknown> = {}
    for (const f of fields) {
        const raw = data[f.key]
        const empty = raw === undefined || raw === null || raw === ''
        if (empty) {
            if (f.required) throw AppError.badRequest(`Missing required field: ${f.label} (${f.key})`, 'CMS_REQUIRED')
            out[f.key] = null
            continue
        }
        switch (f.type) {
            case 'text':
            case 'longtext':
            case 'richtext':
            case 'image':
                out[f.key] = String(raw)
                break
            case 'number': {
                const n = typeof raw === 'number' ? raw : Number(raw)
                if (!Number.isFinite(n)) throw AppError.badRequest(`Field ${f.key} must be a number`, 'CMS_NUMBER')
                out[f.key] = n
                break
            }
            case 'boolean':
                out[f.key] = !!raw
                break
            case 'date': {
                const d = new Date(String(raw))
                if (Number.isNaN(d.getTime())) throw AppError.badRequest(`Field ${f.key} must be a date`, 'CMS_DATE')
                out[f.key] = d.toISOString()
                break
            }
            case 'select': {
                const s = String(raw)
                if (f.options && f.options.length > 0 && !f.options.includes(s)) {
                    throw AppError.badRequest(`Field ${f.key} must be one of: ${f.options.join(', ')}`, 'CMS_OPTION')
                }
                out[f.key] = s
                break
            }
            default:
                out[f.key] = raw
        }
    }
    return out
}

// ---- Collections --------------------------------------------------------

export const listCollections = async (tenantId: string) => {
    return db.client.collection.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true } } }
    })
}

export const getCollection = async (tenantId: string, idOrSlug: string) => {
    const collection = await db.client.collection.findFirst({
        where: { tenantId, OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
    })
    if (!collection) throw AppError.notFound(responseMessage.NOT_FOUND('Collection'), 'COLLECTION_NOT_FOUND')
    return collection
}

export const createCollection = async (tenantId: string, input: TCollectionCreate) => {
    const existing = await db.client.collection.findUnique({ where: { tenantId_slug: { tenantId, slug: input.slug } } })
    if (existing) throw AppError.conflict(responseMessage.ALREADY_EXISTS('Collection'), 'COLLECTION_EXISTS')
    return db.client.collection.create({
        data: {
            tenantId,
            name: input.name,
            slug: input.slug,
            description: input.description,
            fields: input.fields as unknown as Prisma.InputJsonValue
        }
    })
}

export const updateCollection = async (tenantId: string, id: string, input: TCollectionUpdate) => {
    await getCollection(tenantId, id)
    return db.client.collection.update({
        where: { id },
        data: {
            name: input.name,
            description: input.description,
            fields: input.fields ? (input.fields as unknown as Prisma.InputJsonValue) : undefined
        }
    })
}

export const deleteCollection = async (tenantId: string, id: string) => {
    const collection = await getCollection(tenantId, id)
    await db.client.collection.delete({ where: { id: collection.id } })
    return collection
}

// ---- Items --------------------------------------------------------------

export const listItems = async (tenantId: string, collectionIdOrSlug: string, opts: { publishedOnly?: boolean } = {}) => {
    const collection = await getCollection(tenantId, collectionIdOrSlug)
    return db.client.collectionItem.findMany({
        where: { collectionId: collection.id, published: opts.publishedOnly ? true : undefined },
        orderBy: [{ published: 'desc' }, { createdAt: 'desc' }]
    })
}

export const getItem = async (tenantId: string, collectionIdOrSlug: string, itemIdOrSlug: string) => {
    const collection = await getCollection(tenantId, collectionIdOrSlug)
    const item = await db.client.collectionItem.findFirst({
        where: {
            collectionId: collection.id,
            tenantId,
            OR: [{ id: itemIdOrSlug }, { slug: itemIdOrSlug }]
        }
    })
    if (!item) throw AppError.notFound(responseMessage.NOT_FOUND('Item'), 'ITEM_NOT_FOUND')
    return { collection, item }
}

export const createItem = async (tenantId: string, collectionId: string, input: TItemCreate) => {
    const collection = await getCollection(tenantId, collectionId)
    const validated = validateAgainstSchema(input.data ?? {}, collection.fields as unknown as TFieldDef[])
    const dup = await db.client.collectionItem.findUnique({
        where: { collectionId_slug: { collectionId: collection.id, slug: input.slug } }
    })
    if (dup) throw AppError.conflict(responseMessage.ALREADY_EXISTS('Item'), 'ITEM_EXISTS')
    return db.client.collectionItem.create({
        data: {
            tenantId,
            collectionId: collection.id,
            slug: input.slug,
            data: validated as unknown as Prisma.InputJsonValue,
            published: !!input.published,
            publishedAt: input.published ? new Date() : null
        }
    })
}

export const updateItem = async (tenantId: string, collectionId: string, itemId: string, input: TItemUpdate) => {
    const { collection, item } = await getItem(tenantId, collectionId, itemId)
    const fields = collection.fields as unknown as TFieldDef[]
    const validated = input.data ? validateAgainstSchema(input.data, fields) : undefined
    const wasPublished = item.published
    const willPublish = input.published ?? wasPublished
    return db.client.collectionItem.update({
        where: { id: item.id },
        data: {
            slug: input.slug,
            data: validated ? (validated as unknown as Prisma.InputJsonValue) : undefined,
            published: input.published,
            publishedAt: !wasPublished && willPublish ? new Date() : undefined
        }
    })
}

export const deleteItem = async (tenantId: string, collectionId: string, itemId: string) => {
    const { item } = await getItem(tenantId, collectionId, itemId)
    await db.client.collectionItem.delete({ where: { id: item.id } })
    return item
}
