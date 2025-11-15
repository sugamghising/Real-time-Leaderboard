import { z } from 'zod';

export const updateUserSchema = z.object({
    displayName: z.string().min(1).optional().or(z.literal(undefined)),
    avatarUrl: z.string().url('Invalid URL format').optional().or(z.literal(undefined)),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
