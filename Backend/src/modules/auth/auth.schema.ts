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

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
        .string()
        .min(8)
        .max(200)
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Password must be at least 8 chars with a letter and a digit')
})

export const updateProfileSchema = z
    .object({
        firstName: z.string().min(1).max(80).optional(),
        lastName: z.string().min(1).max(80).optional(),
        phone: z
            .string()
            .max(20)
            .transform((v) => v.trim())
            .refine((v) => v === '' || v.length >= 5, 'Phone must be at least 5 characters')
            .optional()
    })
    .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' })

// Set-password (one-time-token) flow. Two endpoints:
//   GET  /auth/password/set-token/:token  → verifies the token + returns the
//        masked email so the form can show "set password for j***@gmail.com".
//   POST /auth/password/set-with-token    → consumes the token, sets the
//        new password, returns a fresh JWT pair so the user lands signed-in.
// purpose strings match what we stamp on PasswordResetToken (`enrollment_welcome`,
// `forgot_password`, …) so we can audit which flow redeemed which token.
export const setPasswordWithTokenSchema = z.object({
    token: z.string().min(10).max(200),
    newPassword: z
        .string()
        .min(8)
        .max(200)
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Password must be at least 8 chars with a letter and a digit')
})

export type TSetPasswordWithTokenInput = z.infer<typeof setPasswordWithTokenSchema>

export type TLoginInput = z.infer<typeof loginSchema>
export type TRegisterInput = z.infer<typeof registerSchema>
export type TRefreshInput = z.infer<typeof refreshSchema>
export type TAcceptInviteInput = z.infer<typeof acceptInviteSchema>
export type TUpdateProfileInput = z.infer<typeof updateProfileSchema>
export type TChangePasswordInput = z.infer<typeof changePasswordSchema>
