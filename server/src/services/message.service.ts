import prisma from "../config/db";
import { redis } from "../config/redis";


const UNREAD_KEY = (userId: string) => `unread:${userId}`;

export const createMessage = async (fromUserId: string, toUserId: string, content: string) => {
    const created = await prisma.message.create({
        data: {
            fromUserId,
            toUserId,
            content,
            isRead: false,
        }
    });

    await redis.incr(UNREAD_KEY(toUserId));

    return created;
}

//fetch users conversation (paginated)
export const getConversation = async (userA: string, userB: string, limit = 50, cursor?: string) => {
    const where: any = {
        OR: [
            { fromUserId: userA, toUserId: userB },
            { fromUserId: userB, toUserId: userA }
        ]
    };

    if (cursor) {
        where.createdAt = { lt: new Date(cursor) };
    }
    const messages = await prisma.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return messages.reverse();
};


export const markMessagesAsRead = async (userId: string, messageIds: string[]) => {

    //find unread messages
    const toMark = await prisma.message.findMany({
        where: {
            id: { in: messageIds },
            toUserId: userId,
            isRead: false
        }
    });

    if (toMark.length === 0) return { updated: 0 };

    //update them to isRead true
    const idsToUpdate = toMark.map(m => m.id);
    await prisma.message.updateMany({
        where: { id: { in: idsToUpdate } },
        data: { isRead: true }
    })

    // decrement unread counter by number of updated messages
    const decBy = toMark.length;


    //getcurrent value and update the unread counter
    const key = UNREAD_KEY(userId);
    const val = await redis.get(key);
    const current = val ? parseInt(val, 10) : 0;
    const newVal = Math.max(0, current - decBy);
    await redis.set(key, String(newVal));

    return { updated: toMark.length };
}

export const getUnreadCount = async (userId: string) => {
    const val = await redis.get(UNREAD_KEY(userId));
    return val ? parseInt(val, 10) : 0;
};


export const resetUnread = async (userId: string) => {
    await redis.set(UNREAD_KEY(userId), "0");
    return 0;
};

export const syncUnreadCount = async (userId: string) => {
    // Count actual unread messages in database
    const count = await prisma.message.count({
        where: {
            toUserId: userId,
            isRead: false
        }
    });

    // Sync with Redis
    await redis.set(UNREAD_KEY(userId), String(count));
    return count;
};

export const getLastMessageBetween = async (userA: string, userB: string) => {
    const msg = await prisma.message.findFirst({
        where: {
            OR: [
                { fromUserId: userA, toUserId: userB },
                { fromUserId: userB, toUserId: userA }
            ]
        },
        orderBy: { createdAt: 'desc' }
    });
    return msg || null;
};