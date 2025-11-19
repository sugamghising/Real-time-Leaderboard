import prisma from "../config/db";

interface UpdateUserData {
    displayName?: string | undefined;
    avatarUrl?: string | undefined;
}

export const getAllUser = () => {
    return prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            displayName: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

export const getUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            displayName: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

export const updateUser = (userId: string, data: UpdateUserData) => {
    const updateData: any = {};

    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    return prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            displayName: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

export const deleteUser = (userId: string) => {
    return prisma.user.delete({ where: { id: userId } });
};

export const searchUsers = async (query: string, currentUserId?: string) => {
    const q = query.trim();
    // find matching users by username or email (case-insensitive)
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatarUrl: true,
            createdAt: true
        },
        take: 20
    });

    if (!currentUserId) {
        // return simple shape
        return users.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            profilePicture: u.avatarUrl || null,
            friendshipStatus: 'NONE'
        }));
    }

    // If current user provided, fetch friendships involving currentUser and these users
    const userIds = users.map(u => u.id);
    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [
                { requesterId: currentUserId, receiverId: { in: userIds } },
                { requesterId: { in: userIds }, receiverId: currentUserId }
            ]
        }
    });

    const friendMap = new Map<string, any>();
    friendships.forEach(f => {
        const otherId = f.requesterId === currentUserId ? f.receiverId : f.requesterId;
        friendMap.set(otherId, { status: f.status, id: f.id, requesterId: f.requesterId, receiverId: f.receiverId });
    });

    return users.map(u => {
        const f = friendMap.get(u.id);
        return {
            id: u.id,
            username: u.username,
            email: u.email,
            profilePicture: u.avatarUrl || null,
            friendshipStatus: f ? f.status : 'NONE',
            friendshipId: f ? f.id : undefined
        };
    });
};