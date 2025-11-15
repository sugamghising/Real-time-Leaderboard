import prisma from '../config/db';

interface scoreData {
    userId: string,
    gameId: string,
    score: number,
    meta?: any | undefined;
}

export const createScore = (data: scoreData) => {
    const { userId, gameId, score, meta } = data;
    return prisma.score.create({
        data: {
            userId,
            gameId,
            score,
            meta: meta ?? {}
        }
    })
}
//get best score
export const getBestScoreForUser = (userId: string, gameId: string) => {
    const bestScore = prisma.score.findFirst({ where: { userId, gameId }, orderBy: { score: "desc" } });
    return bestScore
}