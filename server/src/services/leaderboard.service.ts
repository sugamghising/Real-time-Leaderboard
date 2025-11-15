import { redis } from '../config/redis';

// Helper date formatter
function yyyymmdd(date = new Date()) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}

export const leaderboardService = {
    gameKey: (gameId: string) => `leaderboard:game:${gameId}`,
    globalKey: () => `leaderboard:global`,
    dayKey: (gameId: string, date = new Date()) => `leaderboard:game:${gameId}:${yyyymmdd(date)}`,

    /**
     * Update sorted sets if newScore is better than existing score.
     * Returns: { updated: boolean, rank?: number, score?: number }
     */
    async updateScoresIfBetter(gameId: string, userId: string, newScore: number) {
        const gameKey = this.gameKey(gameId);
        const globalKey = this.globalKey();
        const dayKey = this.dayKey(gameId);

        // Fetch current scores
        const [
            currGameScoreRaw,
            currGlobalScoreRaw,
            currDayScoreRaw
        ] = await Promise.all([
            redis.zScore(gameKey, userId),
            redis.zScore(globalKey, userId),
            redis.zScore(dayKey, userId)
        ]);

        const currGameScore = currGameScoreRaw === null ? null : Number(currGameScoreRaw);
        const currGlobalScore = currGlobalScoreRaw === null ? null : Number(currGlobalScoreRaw);
        const currDayScore = currDayScoreRaw === null ? null : Number(currDayScoreRaw);

        // Only update the leaderboard entry if newScore > current
        const shouldUpdateGame = currGameScore === null || newScore > currGameScore;
        const shouldUpdateGlobal = currGlobalScore === null || newScore > currGlobalScore;
        const shouldUpdateDay = currDayScore === null || newScore > currDayScore;

        const multi = redis.multi();

        if (shouldUpdateGame) {
            multi.zAdd(gameKey, { score: newScore, value: userId });
        }
        if (shouldUpdateGlobal) {
            multi.zAdd(globalKey, { score: newScore, value: userId });
        }
        if (shouldUpdateDay) {
            multi.zAdd(dayKey, { score: newScore, value: userId });
            // Set TTL for dayKey (keep 90 days)
            multi.expire(dayKey, 90 * 24 * 60 * 60);
        }

        // Execute multi if any updates were made
        if (shouldUpdateGame || shouldUpdateGlobal || shouldUpdateDay) {
            await multi.exec();
        }

        // Compute new rank (1-based) from gameKey
        const rankRaw = await redis.zRevRank(gameKey, userId);
        const rank = rankRaw === null ? null : rankRaw + 1;

        const storedScoreRaw = await redis.zScore(gameKey, userId);
        const storedScore = storedScoreRaw === null ? null : Number(storedScoreRaw);

        return {
            updated: shouldUpdateGame || shouldUpdateGlobal || shouldUpdateDay,
            rank,
            score: storedScore
        };
    },

    /**
     * Get top N players for a game leaderboard
     */
    async getGameLeaderboard(gameId: string, limit = 100) {
        const gameKey = this.gameKey(gameId);
        const results = await redis.zRangeWithScores(gameKey, 0, limit - 1, { REV: true });

        return results.map((item, index) => ({
            rank: index + 1,
            userId: item.value,
            score: item.score
        }));
    },

    /**
     * Get global leaderboard (top N across all games)
     */
    async getGlobalLeaderboard(limit = 100) {
        const globalKey = this.globalKey();
        const results = await redis.zRangeWithScores(globalKey, 0, limit - 1, { REV: true });

        return results.map((item, index) => ({
            rank: index + 1,
            userId: item.value,
            score: item.score
        }));
    },

    /**
     * Get daily leaderboard for a specific game
     */
    async getDailyLeaderboard(gameId: string, date = new Date(), limit = 100) {
        const dayKey = this.dayKey(gameId, date);
        const results = await redis.zRangeWithScores(dayKey, 0, limit - 1, { REV: true });

        return results.map((item, index) => ({
            rank: index + 1,
            userId: item.value,
            score: item.score
        }));
    },

    /**
     * Get user's rank and score in a game leaderboard
     */
    async getUserRankInGame(gameId: string, userId: string) {
        const gameKey = this.gameKey(gameId);
        const rankRaw = await redis.zRevRank(gameKey, userId);
        const scoreRaw = await redis.zScore(gameKey, userId);

        if (rankRaw === null || scoreRaw === null) {
            return null;
        }

        return {
            rank: rankRaw + 1,
            score: Number(scoreRaw)
        };
    }
};

// Legacy export for backward compatibility
export const updateScoreIfBetter = leaderboardService.updateScoresIfBetter.bind(leaderboardService);