import { z } from 'zod'

// CMS field schema — one entry per column the SA wants to store on items.
// Types map onto the editor's input widget; `select` carries an `options`
// list (string values shown to the user).
export const FIELD_TYPES = ['text', 'longtext', 'richtext', 'number', 'boolean', 'date', 'image', 'select'] as const

export const fieldDefSchema = z.object({
    key: z
        .string()
        .min(1)
        .max(40)
        .regex(/^[a-z][a-z0-9_]*$/, 'Use lowercase letters, digits, underscore — must start with a letter'),
    label: z.string().min(1).max(80),
    type: z.enum(FIELD_TYPES),
    required: z.boolean().optional(),
    options: z.array(z.string().min(1).max(80)).optional() // for `select`
})

export const collectionCreateSchema = z.object({
    name: z.string().min(1).max(80),
    slug: z
        .string()
        .min(1)
        .max(60)
        .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Use lowercase, digits, hyphens'),
    description: z.string().max(500).optional(),
    fields: z.array(fieldDefSchema).max(40).default([])
})

export const collectionUpdateSchema = z.object({
    name: z.string().min(1).max(80).optional(),
    description: z.string().max(500).optional(),
    fields: z.array(fieldDefSchema).max(40).optional()
})

export const itemCreateSchema = z.object({
    slug: z
        .string()
        .min(1)
        .max(120)
        .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, 'Use lowercase, digits, hyphens'),
    data: z.record(z.string(), z.unknown()).default({}),
    published: z.boolean().optional()
})

export const itemUpdateSchema = z.object({
    slug: z
        .string()
        .min(1)
        .max(120)
        .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, 'Use lowercase, digits, hyphens')
        .optional(),
    data: z.record(z.string(), z.unknown()).optional(),
    published: z.boolean().optional()
})

export type TFieldDef = z.infer<typeof fieldDefSchema>
export type TCollectionCreate = z.infer<typeof collectionCreateSchema>
export type TCollectionUpdate = z.infer<typeof collectionUpdateSchema>
export type TItemCreate = z.infer<typeof itemCreateSchema>
export type TItemUpdate = z.infer<typeof itemUpdateSchema>
