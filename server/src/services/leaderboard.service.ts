import { redis } from '../config/redis';

function yyyymmdd(date = new Date()) {
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, '0');
	const d = String(date.getUTCDate()).padStart(2, '0');
	return `${y}${m}${d}`;
}

function parseZrange(raw: string[]): { userId: string; score: number }[] {
	const results: { userId: string; score: number }[] = [];
	for (let i = 0; i < raw.length - 1; i += 2) {
		const member = raw[i];
		const scoreStr = raw[i + 1];
		if (member && scoreStr != null) {
			results.push({ userId: member, score: Number(scoreStr) });
		}
	}
	return results;
}

export const leaderboardService = {
	gameKey: (gameId: string) => `leaderboard:game:${gameId}`,
	globalKey: () => `leaderboard:global`,
	dayKey: (gameId: string, date = new Date()) => `leaderboard:game:${gameId}:${yyyymmdd(date)}`,

	async updateScoresIfBetter(gameId: string, userId: string, newScore: number) {
		const gameKey = this.gameKey(gameId);
		const globalKey = this.globalKey();
		const dayKey = this.dayKey(gameId);

		const [currGameScoreRaw, currGlobalScoreRaw, currDayScoreRaw] = await Promise.all([
			redis.zscore(gameKey, userId),
			redis.zscore(globalKey, userId),
			redis.zscore(dayKey, userId)
		]);

		const currGameScore = currGameScoreRaw === null ? null : Number(currGameScoreRaw);
		const currGlobalScore = currGlobalScoreRaw === null ? null : Number(currGlobalScoreRaw);
		const currDayScore = currDayScoreRaw === null ? null : Number(currDayScoreRaw);

		const shouldUpdateGame = currGameScore === null || newScore > currGameScore;
		const shouldUpdateGlobal = currGlobalScore === null || newScore > currGlobalScore;
		const shouldUpdateDay = currDayScore === null || newScore > currDayScore;

		const multi = redis.multi();

		if (shouldUpdateGame) {
			multi.zadd(gameKey, { score: newScore, member: userId });
		}
		if (shouldUpdateGlobal) {
			multi.zadd(globalKey, { score: newScore, member: userId });
		}
		if (shouldUpdateDay) {
			multi.zadd(dayKey, { score: newScore, member: userId });
			multi.expire(dayKey, 90 * 24 * 60 * 60);
		}

		if (shouldUpdateGame || shouldUpdateGlobal || shouldUpdateDay) {
			await multi.exec();
		}

		const rankRaw = await redis.zrevrank(gameKey, userId);
		const rank = rankRaw === null ? null : rankRaw + 1;

		const storedScoreRaw = await redis.zscore(gameKey, userId);
		const storedScore = storedScoreRaw === null ? null : Number(storedScoreRaw);

		return {
			updated: shouldUpdateGame || shouldUpdateGlobal || shouldUpdateDay,
			rank,
			score: storedScore
		};
	},

	async getGameLeaderboard(gameId: string, limit = 100) {
		const gameKey = this.gameKey(gameId);
		const raw = await redis.zrange<string[]>(gameKey, 0, limit - 1, { rev: true, withScores: true });
		return parseZrange(raw).map((item, index) => ({ ...item, rank: index + 1 }));
	},

	async getGlobalLeaderboard(limit = 100) {
		const globalKey = this.globalKey();
		const raw = await redis.zrange<string[]>(globalKey, 0, limit - 1, { rev: true, withScores: true });
		console.log(`Global leaderboard results for key ${globalKey}:`, raw);
		return parseZrange(raw).map((item, index) => ({ ...item, rank: index + 1 }));
	},

	async getDailyLeaderboard(gameId: string, date = new Date(), limit = 100) {
		const dayKey = this.dayKey(gameId, date);
		const raw = await redis.zrange<string[]>(dayKey, 0, limit - 1, { rev: true, withScores: true });
		return parseZrange(raw).map((item, index) => ({ ...item, rank: index + 1 }));
	},

	async getUserRankInGame(gameId: string, userId: string) {
		const gameKey = this.gameKey(gameId);
		const rankRaw = await redis.zrevrank(gameKey, userId);
		const scoreRaw = await redis.zscore(gameKey, userId);

		if (rankRaw === null || scoreRaw === null) {
			return null;
		}

		return {
			rank: rankRaw + 1,
			score: Number(scoreRaw)
		};
	}
};

export const updateScoreIfBetter = leaderboardService.updateScoresIfBetter.bind(leaderboardService);
