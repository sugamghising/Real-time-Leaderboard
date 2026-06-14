import { z } from "zod";

export const createSessionSchema = z.object({
  gameId: z.string().uuid(),
  score: z.number().int().nonnegative(),
  duration: z.number().int().positive().optional(),
  status: z.enum(["COMPLETED", "ABORTED"]).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const getSessionsQuerySchema = z.object({
  gameId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  cursor: z.string().optional(),
});
