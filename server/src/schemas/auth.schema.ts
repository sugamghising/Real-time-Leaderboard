import { z } from 'zod';


export const registerSchema = z.object({
    username: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Invalid email format'),
    password: z.string().min(8, 'Password must be 6 letters.')
})

export const loginSchema = z.object({
    email: z.email('Invalid email format'),
    password: z.string().min(1, 'Passsword is required')
})

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>