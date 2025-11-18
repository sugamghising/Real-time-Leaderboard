/**
 * Friendship-related types
 */

import type { FriendshipStatus } from './common.types';
import type { UserProfile } from './user.types';

export interface Friendship {
    id: string;
    requesterId: string;
    receiverId: string;
    status: FriendshipStatus;
    createdAt: Date;
    updatedAt: Date;
    requester?: UserProfile;
    receiver?: UserProfile;
}

export interface SendFriendRequestInput {
    receiverId: string;
}

export interface SendFriendRequestResponse {
    message: string;
    friendship: Friendship;
}

export interface RespondFriendRequestResponse {
    message: string;
    friendship: Friendship;
}

export interface FriendWithDetails {
    id: string;
    requesterId: string;
    receiverId: string;
    status: FriendshipStatus;
    createdAt: Date;
    updatedAt: Date;
    friendUser: UserProfile;
}

export interface FriendshipWithUsers extends Friendship {
    requester: UserProfile;
    receiver: UserProfile;
}

export interface FriendRequest extends Friendship {
    requester: UserProfile;
    receiver: UserProfile;
}

export type FriendStatus = FriendshipStatus | 'NOT_FRIENDS' | 'YOU_SENT' | 'THEY_SENT';
