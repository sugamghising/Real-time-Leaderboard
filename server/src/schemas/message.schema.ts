import { z } from "zod";

export const createMessageSchema = z.object({
    toUserId: z.string().uuid('Invalid user ID format'),
    content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long (max 2000 characters)'),
});

export const markReadSchema = z.object({
    messageIds: z.array(z.string().uuid('Invalid message ID format')).min(1, 'At least one message ID required'),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;