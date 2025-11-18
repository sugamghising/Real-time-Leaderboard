/**
 * Socket.IO event types
 */

import type { Friendship } from './friendship.types';

export interface SocketMessageNewEvent {
    id: string;
    fromUserId: string;
    toUserId: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
}

export interface SocketMessageSentEvent {
    id: string;
    fromUserId: string;
    toUserId: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
}

export interface SocketUnreadCountEvent {
    count: number;
}

export interface SocketLeaderboardUpdateEvent {
    gameId: string;
    userId: string;
    score: number;
    rank: number;
}

export interface SocketFriendRequestEvent {
    friendship: Friendship;
}

export interface SocketFriendAcceptedEvent {
    friendship: Friendship;
}

export interface SocketFriendRejectedEvent {
    friendship: Friendship;
}
