import { z } from 'zod'
import { Role, UserStatus } from '@prisma/client'

export const inviteUserSchema = z.object({
    email: z.string().email(),
    role: z.nativeEnum(Role)
})

export const listUsersQuerySchema = z.object({
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    q: z.string().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    // §5.3 Phase B — relationship scopes that resolve "my X" via the auth context.
    //   trainerScope=me  → STUDENT users enrolled in courses owned by the actor.
    //   managerScope=me  → COUNSELLOR users whose managerId = actor.
    trainerScope: z.literal('me').optional(),
    managerScope: z.literal('me').optional()
})

export const updateUserSchema = z.object({
    firstName: z.string().min(1).max(80).optional(),
    lastName: z.string().min(1).max(80).optional(),
    phone: z.string().min(5).max(20).optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(UserStatus).optional()
})

export type TInviteUserInput = z.infer<typeof inviteUserSchema>
export type TListUsersQuery = z.infer<typeof listUsersQuerySchema>
export type TUpdateUserInput = z.infer<typeof updateUserSchema>
