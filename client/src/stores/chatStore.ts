/**
 * Chat Store - Zustand
 * Manages messaging state
 */

import { create } from 'zustand';
import type { Message, User } from '../types';

interface Conversation {
    user: User;
    messages: Message[];
    unreadCount: number;
    lastMessage?: Message;
}

interface ChatState {
    conversations: Map<string, Conversation>;
    activeConversationId: string | null;
    totalUnreadCount: number;

    setConversations: (conversations: Conversation[]) => void;
    addMessage: (userId: string, message: Message) => void;
    setActiveConversation: (userId: string | null) => void;
    markAsRead: (userId: string) => void;
    setUnreadCount: (count: number) => void;
    incrementUnread: (userId: string) => void;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
    conversations: new Map(),
    activeConversationId: null,
    totalUnreadCount: 0,

    setConversations: (conversations) =>
        set({
            conversations: new Map(
                conversations.map((conv) => [conv.user.id, conv])
            ),
        }),

    addMessage: (userId, message) =>
        set((state) => {
            const newConversations = new Map(state.conversations);
            const conversation = newConversations.get(userId);

            if (conversation) {
                conversation.messages.push(message);
                conversation.lastMessage = message;

                // Increment unread if not active conversation
                if (state.activeConversationId !== userId && message.fromUserId === userId) {
                    conversation.unreadCount += 1;
                }
            } else {
                // Create new conversation
                newConversations.set(userId, {
                    user: { id: userId } as User, // Partial user, should be populated
                    messages: [message],
                    unreadCount: message.fromUserId === userId ? 1 : 0,
                    lastMessage: message,
                });
            }

            return { conversations: newConversations };
        }),

    setActiveConversation: (userId) =>
        set({ activeConversationId: userId }),

    markAsRead: (userId) =>
        set((state) => {
            const newConversations = new Map(state.conversations);
            const conversation = newConversations.get(userId);

            if (conversation) {
                const unreadDiff = conversation.unreadCount;
                conversation.unreadCount = 0;

                return {
                    conversations: newConversations,
                    totalUnreadCount: Math.max(0, state.totalUnreadCount - unreadDiff),
                };
            }

            return state;
        }),

    setUnreadCount: (count) =>
        set({ totalUnreadCount: count }),

    incrementUnread: (userId) =>
        set((state) => {
            const newConversations = new Map(state.conversations);
            const conversation = newConversations.get(userId);

            if (conversation) {
                conversation.unreadCount += 1;
            }

            return {
                conversations: newConversations,
                totalUnreadCount: state.totalUnreadCount + 1,
            };
        }),

    clearChat: () =>
        set({
            conversations: new Map(),
            activeConversationId: null,
            totalUnreadCount: 0,
        }),
}));
