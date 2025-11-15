import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createScore, getBestScoreForUser } from '../controllers/score.controller';

const scoreRouter = express.Router();

// POST /v1/api/scores/:id - Submit score for a game (id = gameId)
scoreRouter.post('/:id', requireAuth, createScore);

// GET /v1/api/scores/:id/best - Get best score for authenticated user in a game
scoreRouter.get('/:id/best', requireAuth, getBestScoreForUser);

export default scoreRouter;
