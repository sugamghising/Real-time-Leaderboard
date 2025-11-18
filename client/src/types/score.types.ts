/**
 * Score-related types
 */

import type { UserProfile } from './user.types';
import type { Game } from './game.types';

export interface Score {
    id: string;
    userId: string;
    gameId: string;
    score: number;
    meta?: Record<string, unknown> | null;
    createdAt: Date;
    user?: UserProfile;
    game?: Game;
}

export interface CreateScoreInput {
    score: number;
    meta?: Record<string, unknown>;
}

export interface CreateScoreResponse {
    success: boolean;
    saved: Score;
    leaderboardUpdated: boolean;
    rank: number | null;
    score: number | null;
}

export interface ScoreWithUser extends Score {
    user: UserProfile;
    game: Game;
}

export type SubmitScoreData = CreateScoreInput;
