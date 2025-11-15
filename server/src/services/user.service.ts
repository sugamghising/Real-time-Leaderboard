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
    return prisma.user.update({ 
        where: { id: userId }, 
        data: {
            displayName: data.displayName,
            avatarUrl: data.avatarUrl
        },
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