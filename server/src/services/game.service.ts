import prisma from '../config/db';

interface CreateGameData {
    slug: string;
    title: string;
    description?: string | undefined;
    metadata?: any | undefined;
    imageUrl?: string | undefined;
}

interface UpdateGameData {
    slug?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    metadata?: any | undefined;
    imageUrl?: string | undefined;
}

export const createGame = (data: CreateGameData, adminId: string) => {
    return prisma.game.create({
        data: {
            slug: data.slug,
            title: data.title,
            ...(data.description !== undefined && { description: data.description }),
            ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
            ...(data.metadata !== undefined && { metadata: data.metadata }),
            createdById: adminId
        },
    });
};

export const findAllGame = () => {
    return prisma.game.findMany({
        include: {
            createdBy: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    });
};

export const findGameById = async (gameId: string) => {
    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            createdBy: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    });

    if (!game) {
        throw new Error('Game not found');
    }

    return game;
};

export const updateGame = (gameId: string, data: UpdateGameData) => {
    const updateData: any = {};

    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    return prisma.game.update({
        where: { id: gameId },
        data: updateData
    });
};

export const deleteGame = (gameId: string) => {
    return prisma.game.delete({ where: { id: gameId } });
};