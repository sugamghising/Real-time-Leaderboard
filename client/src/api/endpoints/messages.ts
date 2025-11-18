import api from '../axios';
import type {
    Message,
    MessageWithUser,
    SendMessageData,
    ApiResponse,
    PaginatedResponse
} from '../../types';

/**
 * Send a message
 */
export const sendMessage = async (data: SendMessageData): Promise<ApiResponse<Message>> => {
    const response = await api.post<ApiResponse<Message>>('/v1/api/messages', data);
    return response.data;
};

/**
 * Get conversation with a user
 */
export const getConversation = async (userId: string): Promise<ApiResponse<MessageWithUser[]>> => {
    const response = await api.get<ApiResponse<MessageWithUser[]>>(`/v1/api/messages/conversation/${userId}`);
    return response.data;
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (data: { conversationUserId: string }): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/v1/api/messages/mark-read', data);
    return response.data;
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/v1/api/messages/unread-count');
    return response.data;
};
