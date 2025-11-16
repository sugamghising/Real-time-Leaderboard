import { z } from 'zod';

export const createGameSchema = z.object({
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().or(z.literal(undefined)),
    metadata: z.union([
        z.record(z.string(), z.any()),
        z.string().transform((str) => {
            try {
                return JSON.parse(str);
            } catch {
                return {};
            }
        })
    ]).optional().or(z.literal(undefined)),
});

export const updateGameSchema = z.object({
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional().or(z.literal(undefined)),
    title: z.string().min(1, 'Title is required').optional().or(z.literal(undefined)),
    description: z.string().optional().or(z.literal(undefined)),
    metadata: z.union([
        z.record(z.string(), z.any()),
        z.string().transform((str) => {
            try {
                return JSON.parse(str);
            } catch {
                return {};
            }
        })
    ]).optional().or(z.literal(undefined)),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
