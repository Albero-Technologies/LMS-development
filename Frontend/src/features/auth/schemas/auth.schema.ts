import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Minimum 8 characters')
})
export type TLogin = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    tenantName: z.string().min(2, 'Enter your institute name'),
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().optional(),
    password: z
        .string()
        .min(8, 'Minimum 8 characters')
        .regex(/[A-Z]/, 'At least one uppercase letter')
        .regex(/[0-9]/, 'At least one number')
})
export type TRegister = z.infer<typeof registerSchema>

export const forgotSchema = z.object({ email: z.string().email('Enter a valid email') })
export type TForgot = z.infer<typeof forgotSchema>
