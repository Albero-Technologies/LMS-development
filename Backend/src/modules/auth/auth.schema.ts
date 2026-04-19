import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(200),
    tenantSlug: z.string().min(1).max(80).optional()
})

export const registerSchema = z.object({
    email: z.string().email().max(254),
    password: z
        .string()
        .min(8)
        .max(200)
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Password must be at least 8 chars with a letter and a digit'),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    phone: z.string().min(5).max(20).optional(),
    tenantSlug: z.string().min(1).max(80)
})

export const refreshSchema = z.object({
    refreshToken: z.string().min(10).optional()
})

export const googleCodeSchema = z.object({
    code: z.string().min(10),
    state: z.string().optional()
})

export const acceptInviteSchema = z.object({
    token: z.string().min(10),
    password: z
        .string()
        .min(8)
        .max(200)
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    phone: z.string().min(5).max(20).optional()
})

export type TLoginInput = z.infer<typeof loginSchema>
export type TRegisterInput = z.infer<typeof registerSchema>
export type TRefreshInput = z.infer<typeof refreshSchema>
export type TGoogleCodeInput = z.infer<typeof googleCodeSchema>
export type TAcceptInviteInput = z.infer<typeof acceptInviteSchema>
