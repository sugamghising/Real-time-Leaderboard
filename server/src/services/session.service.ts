import prisma from "../config/db";
import { leaderboardService } from "./leaderboard.service";

export const sessionService = {
  async create(data: {
    userId: string;
    gameId: string;
    score: number;
    duration?: number;
    status?: "COMPLETED" | "ABORTED";
    meta?: Record<string, unknown>;
  }) {
    const [session] = await prisma.$transaction([
      prisma.gameSession.create({
        data: {
          userId: data.userId,
          gameId: data.gameId,
          score: data.score,
          ...(data.duration != null ? { duration: data.duration } : {}),
          ...(data.status ? { status: data.status as any } : {}),
          ...(data.meta ? { meta: data.meta as any } : {}),
        },
      }),
      prisma.score.create({
        data: {
          userId: data.userId,
          gameId: data.gameId,
          score: data.score,
          ...(data.meta ? { meta: data.meta as any } : {}),
        },
      }),
    ]);

    if (session.status === "COMPLETED") {
      await leaderboardService.updateScoresIfBetter(data.gameId, data.userId, data.score);
    }

    return session;
  },

  async listByGame(gameId: string, opts: { limit: number; cursor?: string }) {
    const where: Record<string, any> = { gameId };
    if (opts.cursor) {
      where.createdAt = { lt: new Date(opts.cursor) };
    }

    const sessions = await prisma.gameSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: opts.limit + 1,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    const hasMore = sessions.length > opts.limit;
    if (hasMore) sessions.pop();

    return {
      sessions,
      nextCursor: hasMore ? sessions[sessions.length - 1]?.createdAt.toISOString() : null,
      hasMore,
    };
  },

  async getStats(gameId: string) {
    const [totalPlays, best, avgScore] = await Promise.all([
      prisma.gameSession.count({ where: { gameId, status: "COMPLETED" } }),
      prisma.gameSession.findFirst({
        where: { gameId, status: "COMPLETED" },
        orderBy: { score: "desc" },
        select: { score: true, userId: true },
      }),
      prisma.gameSession.aggregate({
        where: { gameId, status: "COMPLETED" },
        _avg: { score: true },
      }),
    ]);

    return {
      totalPlays,
      bestScore: best?.score ?? 0,
      bestPlayerId: best?.userId ?? null,
      averageScore: Math.round(avgScore._avg.score ?? 0),
    };
  },
};
