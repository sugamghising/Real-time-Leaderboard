import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    getGameLeaderboard,
    getGlobalLeaderboard,
    getDailyLeaderboard,
    getUserRank
} from '../controllers/leaderboard.controller';

const leaderboardRouter = express.Router();

// GET /v1/api/leaderboard/global - Get global leaderboard
leaderboardRouter.get('/global', getGlobalLeaderboard);

// GET /v1/api/leaderboard/game/:id - Get game-specific leaderboard
leaderboardRouter.get('/game/:id', getGameLeaderboard);

// GET /v1/api/leaderboard/game/:id/daily - Get daily leaderboard for a game
leaderboardRouter.get('/game/:id/daily', getDailyLeaderboard);

// GET /v1/api/leaderboard/game/:id/rank - Get authenticated user's rank in a game
leaderboardRouter.get('/game/:id/rank', requireAuth, getUserRank);

export default leaderboardRouter;
