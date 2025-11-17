import prisma from '../config/db';
import { redis } from '../config/redis'


const FRIEND_REQ_UNREAD_KEY = (userId: string) => `friend:req:unread:${userId}`;

export const sendRequest = async (requesterId: string, receiverId: string) => {
    if (requesterId === receiverId) {
        throw new Error("Can't send request to yourself.");
    }

    const existing = await prisma.friendship.findFirst({
        where: {
            OR: [
                { requesterId: requesterId, receiverId: receiverId },
                { requesterId: receiverId, receiverId: requesterId }
            ]
        }
    });

    if (existing) {
        if (existing.status === "PENDING") throw new Error("Friend request already pending");
        if (existing.status === "ACCEPTED") throw new Error("Already friends");
        // If REJECTED, re-request;creat new request by deleting rejected and create new
        if (existing.status === "REJECTED") {
            await prisma.friendship.delete({ where: { id: existing.id } });
        }
    }

    const created = await prisma.friendship.create({
        data: {
            requesterId,
            receiverId,
            status: 'PENDING'
        }
    });

    // Increment unread friend request counter for recipient (receiver)
    await redis.incr(FRIEND_REQ_UNREAD_KEY(receiverId));
    return created;
}

export const respondRequestAccept = async (userId: string, requestId: string) => {
    const req = await prisma.friendship.findUnique({ where: { id: requestId } });
    if (!req) {
        throw new Error("Request not found");
    }
    if (req.receiverId !== userId) throw new Error("Not authorized to accept this request")
    if (req.status !== "PENDING") throw new Error("Request not Pending");

    const updated = await prisma.friendship.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' }
    })
    await redis.decr(FRIEND_REQ_UNREAD_KEY(userId)).catch(() => { });
    return updated;

}

export const respondRequestReject = async (userId: string, requestId: string) => {
    const req = await prisma.friendship.findUnique({ where: { id: requestId } });
    if (!req) {
        throw new Error("Request not found");
    }
    if (req.receiverId !== userId) throw new Error("Not authorized to reject this request")
    if (req.status !== "PENDING") throw new Error("Request not Pending");

    const updated = await prisma.friendship.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
    })

    //decrement unread counter
    await redis.decr(FRIEND_REQ_UNREAD_KEY(userId)).catch(() => { });
    return updated;
}

export const removeFriend = async (userId: string, friendId: string) => {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { requesterId: userId, receiverId: friendId, status: "ACCEPTED" },
                { requesterId: friendId, receiverId: userId, status: "ACCEPTED" }
            ]
        }
    });

    if (!friendship) throw new Error("Friend  doesn't match");

    await prisma.friendship.delete({ where: { id: friendship.id } });

    return true;
}


export const listFriends = async (userId: string) => {
    const friends = await prisma.friendship.findMany({
        where: {
            OR: [
                { requesterId: userId, status: "ACCEPTED" },
                { receiverId: userId, status: "ACCEPTED" }
            ]
        },
        include: {
            requester: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true
                }
            },
            receiver: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true
                }
            }
        }
    });

    return friends.map((r: any) => {
        const friend = r.requesterId === userId ? r.receiver : r.requester;
        return {
            id: r.id,
            friendId: friend.id,
            friend: {
                id: friend.id,
                username: friend.username,
                displayName: friend.displayName,
                avatarUrl: friend.avatarUrl
            },
            status: r.status,
            createdAt: r.createdAt
        };
    });
}

export const listPendingrequest = async (userId: string) => {
    // requests received
    const received = await prisma.friendship.findMany({
        where: { receiverId: userId, status: "PENDING" },
        orderBy: { createdAt: "desc" }
    });
    // requests sent by user
    const sent = await prisma.friendship.findMany({
        where: { requesterId: userId, status: "PENDING" },
        orderBy: { createdAt: "desc" }
    });

    return { received, sent };
}


export const getPendingCount = async (userId: string) => {
    const val = await redis.get(FRIEND_REQ_UNREAD_KEY(userId));
    return val ? parseInt(val, 10) : 0;
}