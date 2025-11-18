/**
 * Leaderboard-related types
 */

import type { UserProfile } from './user.types';

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    score: number;
    user?: UserProfile;
}

export interface LeaderboardUpdate {
    gameId: string;
    userId: string;
    score: number;
    rank: number;
}

export interface UserRank {
    rank: number;
    score: number;
}

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'all-time';
