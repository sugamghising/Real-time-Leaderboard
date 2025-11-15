import { z } from 'zod';

export const createScoreSchema = z.object({
    score: z.number().nonnegative(),
    meta: z.record(z.string(), z.any()).optional()
})

export type createScoreType = z.infer<typeof createScoreSchema>