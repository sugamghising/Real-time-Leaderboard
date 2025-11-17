import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
    receiverId: z.string().uuid('Invalid user ID format')
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
