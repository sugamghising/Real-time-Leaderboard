/**
 * React Context types
 */

import type { Socket } from "socket.io-client";
import type { UserProfile } from './user.types';
import type {
    SocketMessageNewEvent,
    SocketMessageSentEvent,
    SocketUnreadCountEvent,
    SocketLeaderboardUpdateEvent,
    SocketFriendRequestEvent,
    SocketFriendAcceptedEvent,
    SocketFriendRejectedEvent,
} from './socket.types';

export interface AuthContextValue {
    user: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export interface SocketContextValue {
    socket: Socket | null;
    connected: boolean;
    joinGameRoom: (gameId: string) => void;
    leaveGameRoom: (gameId: string) => void;
    onMessageNew: (callback: (message: SocketMessageNewEvent) => void) => void;
    onMessageSent: (callback: (message: SocketMessageSentEvent) => void) => void;
    onUnreadCount: (callback: (data: SocketUnreadCountEvent) => void) => void;
    onLeaderboardUpdate: (callback: (data: SocketLeaderboardUpdateEvent) => void) => void;
    onFriendRequest: (callback: (data: SocketFriendRequestEvent) => void) => void;
    onFriendAccepted: (callback: (data: SocketFriendAcceptedEvent) => void) => void;
    onFriendRejected: (callback: (data: SocketFriendRejectedEvent) => void) => void;
    offMessageNew: (callback?: (message: SocketMessageNewEvent) => void) => void;
    offMessageSent: (callback?: (message: SocketMessageSentEvent) => void) => void;
    offUnreadCount: (callback?: (data: SocketUnreadCountEvent) => void) => void;
    offLeaderboardUpdate: (callback?: (data: SocketLeaderboardUpdateEvent) => void) => void;
    offFriendRequest: (callback?: (data: SocketFriendRequestEvent) => void) => void;
    offFriendAccepted: (callback?: (data: SocketFriendAcceptedEvent) => void) => void;
    offFriendRejected: (callback?: (data: SocketFriendRejectedEvent) => void) => void;
}
