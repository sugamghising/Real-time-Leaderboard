/**
 * Message-related types
 */

import type { UserProfile } from './user.types';

export interface Message {
    id: string;
    fromUserId: string;
    toUserId: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
    fromUser?: UserProfile;
    toUser?: UserProfile;
}

export interface SendMessageInput {
    toUserId: string;
    content: string;
}

export interface SendMessageResponse {
    success: boolean;
    message: Message;
}

export interface GetConversationResponse {
    messages: Message[];
}

export interface MarkMessagesAsReadInput {
    messageIds: string[];
}

export interface MarkMessagesAsReadResponse {
    success: boolean;
    updated: number;
    unreadCount: number;
}

export interface UnreadCountResponse {
    count: number;
}

export interface MessageWithUser extends Message {
    fromUser: UserProfile;
    toUser: UserProfile;
}

export type SendMessageData = SendMessageInput;
