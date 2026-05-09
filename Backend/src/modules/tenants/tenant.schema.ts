import { z } from 'zod'
import { TenantPlan } from '@prisma/client'

export const createTenantSchema = z.object({
    name: z.string().min(2).max(120),
    slug: z
        .string()
        .min(2)
        .max(60)
        .regex(/^[a-z0-9][a-z0-9-]{0,58}[a-z0-9]$/, 'slug must be lowercase alphanumeric with dashes'),
    plan: z.nativeEnum(TenantPlan).optional(),
    adminEmail: z.string().email(),
    adminFirstName: z.string().min(1).max(80),
    adminLastName: z.string().min(1).max(80),
    adminPassword: z
        .string()
        .min(8)
        .max(200)
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/),
    brandingLogo: z.string().url().optional(),
    brandingColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional()
})

export const updateTenantBrandingSchema = z.object({
    name: z.string().min(2).max(120).optional(),
    brandingLogo: z.string().url().nullable().optional(),
    brandingColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .nullable()
        .optional(),
    settings: z.record(z.unknown()).optional(),
    // SUPER_ADMIN-only fields. The tenant's own PATCH /tenants/me is gated
    // on `requirePolicy('tenant', 'write')` which excludes plan + seat-limit
    // overrides — those flow through the SA panel only. Service-layer also
    // double-checks the actor's role before applying these.
    plan: z.nativeEnum(TenantPlan).optional(),
    seatLimitOverride: z.number().int().min(0).max(1_000_000).nullable().optional()
})

// Tenant-side "request plan change" — the admin picks a target plan; the
// platform records the request, notifies SUPER_ADMINs, and issues an
// invoice on approval. Status transitions: REQUESTED → APPROVED / REJECTED.
export const requestPlanChangeSchema = z.object({
    targetPlan: z.nativeEnum(TenantPlan),
    note: z.string().trim().max(500).optional()
})

export type TCreateTenantInput = z.infer<typeof createTenantSchema>
export type TUpdateTenantBrandingInput = z.infer<typeof updateTenantBrandingSchema>
export type TRequestPlanChangeInput = z.infer<typeof requestPlanChangeSchema>
