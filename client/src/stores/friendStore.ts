/**
 * Friend Store - Zustand
 * Manages friends and friend requests
 */

import { create } from 'zustand';
import type { Friendship, User } from '../types';

interface FriendState {
    friends: User[];
    friendRequests: Friendship[];
    pendingCount: number;

    setFriends: (friends: User[]) => void;
    addFriend: (friend: User) => void;
    removeFriend: (friendId: string) => void;

    setFriendRequests: (requests: Friendship[]) => void;
    addFriendRequest: (request: Friendship) => void;
    removeFriendRequest: (requestId: string) => void;

    setPendingCount: (count: number) => void;
    incrementPendingCount: () => void;
    decrementPendingCount: () => void;

    clearFriends: () => void;
}

export const useFriendStore = create<FriendState>()((set) => ({
    friends: [],
    friendRequests: [],
    pendingCount: 0,

    setFriends: (friends) => set({ friends }),

    addFriend: (friend) =>
        set((state) => ({
            friends: [...state.friends, friend],
        })),

    removeFriend: (friendId) =>
        set((state) => ({
            friends: state.friends.filter((f) => f.id !== friendId),
        })),

    setFriendRequests: (requests) =>
        set({
            friendRequests: requests,
            pendingCount: requests.length,
        }),

    addFriendRequest: (request) =>
        set((state) => ({
            friendRequests: [...state.friendRequests, request],
            pendingCount: state.pendingCount + 1,
        })),

    removeFriendRequest: (requestId) =>
        set((state) => ({
            friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
            pendingCount: Math.max(0, state.pendingCount - 1),
        })),

    setPendingCount: (count) => set({ pendingCount: count }),

    incrementPendingCount: () =>
        set((state) => ({ pendingCount: state.pendingCount + 1 })),

    decrementPendingCount: () =>
        set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),

    clearFriends: () =>
        set({
            friends: [],
            friendRequests: [],
            pendingCount: 0,
        }),
}));
