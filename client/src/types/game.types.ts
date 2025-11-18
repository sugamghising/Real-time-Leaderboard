/**
 * Game-related types
 */

import type { UserProfile } from './user.types';

export interface Game {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    metadata?: Record<string, unknown> | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: UserProfile;
}

export interface CreateGameInput {
    slug: string;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
    image?: File;
}

export interface UpdateGameInput {
    slug?: string;
    title?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    image?: File;
}

export interface GameWithParticipants extends Game {
    createdBy: UserProfile;
    participants?: UserProfile[];
    status?: string;
}

export type CreateGameData = CreateGameInput;
export type JoinGameData = { password?: string };
export type GameStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type GameSettings = Partial<Pick<Game, 'title' | 'description' | 'metadata'>>;
