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
    const response = await api.get(`/v1/api/messages/conversation/${userId}`);
    const respData = response.data;
    // server returns { messages: MessageWithUser[] } sometimes, normalize to ApiResponse
    if (respData && Array.isArray(respData.messages)) {
        return { data: respData.messages } as ApiResponse<MessageWithUser[]>;
    }
    return respData as ApiResponse<MessageWithUser[]>;
};

/**
 * Get latest message preview per friend for current user
 */
export const getMessagePreviews = async (): Promise<ApiResponse<{ userId: string; message: MessageWithUser | null }[]>> => {
    const response = await api.get('/v1/api/messages/previews');
    const respData = response.data;
    if (respData && Array.isArray(respData.previews)) {
        return { data: respData.previews } as ApiResponse<{ userId: string; message: MessageWithUser | null }[]>;
    }
    return respData as ApiResponse<{ userId: string; message: MessageWithUser | null }[]>;
};

/**
 * Get a single most-recent message for preview purposes
 */
export const getConversationPreview = async (userId: string): Promise<ApiResponse<MessageWithUser[]>> => {
    const response = await api.get(`/v1/api/messages/conversation/${userId}`, { params: { limit: 1 } });
    const respData = response.data;
    if (respData && Array.isArray(respData.messages)) {
        return { data: respData.messages } as ApiResponse<MessageWithUser[]>;
    }
    if (Array.isArray(respData)) {
        return { data: respData } as ApiResponse<MessageWithUser[]>;
    }
    return respData as ApiResponse<MessageWithUser[]>;
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
