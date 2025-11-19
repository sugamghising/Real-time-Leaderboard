import api from '../axios';
import type {
    Friendship,
    FriendshipWithUsers,
    FriendRequest,
    FriendStatus,
    ApiResponse
} from '../../types';

/**
 * Send a friend request
 */
export const sendFriendRequest = async (recipientId: string): Promise<ApiResponse<Friendship>> => {
    // server expects `receiverId` in the request body (see friend.schema.ts)
    const response = await api.post<ApiResponse<Friendship>>('/v1/api/friends/request', { receiverId: recipientId });
    return response.data;
};

/**
 * Accept a friend request
 */
export const acceptFriendRequest = async (friendshipId: string): Promise<ApiResponse<Friendship>> => {
    const response = await api.post<ApiResponse<Friendship>>(`/v1/api/friends/accept/${friendshipId}`);
    return response.data;
};

/**
 * Reject a friend request
 */
export const rejectFriendRequest = async (friendshipId: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/v1/api/friends/reject/${friendshipId}`);
    return response.data;
};

/**
 * Remove a friend
 */
export const removeFriend = async (friendshipId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/v1/api/friends/${friendshipId}`);
    return response.data;
};

/**
 * Get user's friends
 */
export const getFriends = async (userId?: string): Promise<ApiResponse<FriendshipWithUsers[]>> => {
    const endpoint = userId ? `/v1/api/users/${userId}/friends` : '/v1/api/friends';
    const response = await api.get(endpoint);
    const respData = response.data;
    if (Array.isArray(respData)) {
        return { data: respData } as ApiResponse<FriendshipWithUsers[]>;
    }
    return respData as ApiResponse<FriendshipWithUsers[]>;
};

/**
 * Get pending friend requests (received)
 */
export const getPendingRequests = async (): Promise<ApiResponse<{
    received: FriendRequest[];
    sent: FriendRequest[];
}>> => {
    const response = await api.get('/v1/api/friends/requests');
    const respData = response.data;
    // Server may return a raw object { received, sent } instead of the ApiResponse wrapper
    if (respData && typeof respData.received !== 'undefined') {
        return { data: respData } as ApiResponse<{
            received: FriendRequest[];
            sent: FriendRequest[];
        }>;
    }
    return respData as ApiResponse<{
        received: FriendRequest[];
        sent: FriendRequest[];
    }>;
};

/**
 * Get sent friend requests
 */
export const getSentRequests = async (): Promise<ApiResponse<FriendRequest[]>> => {
    const response = await api.get<ApiResponse<FriendRequest[]>>('/v1/api/friends/requests/sent');
    return response.data;
};

/**
 * Check friendship status with a user
 */
export const checkFriendshipStatus = async (userId: string): Promise<ApiResponse<{
    status: FriendStatus;
    friendshipId?: string;
}>> => {
    const response = await api.get<ApiResponse<{
        status: FriendStatus;
        friendshipId?: string;
    }>>(`/v1/api/friends/status/${userId}`);
    return response.data;
};

/**
 * Search for users (potential friends)
 */
export const searchUsers = async (query: string): Promise<ApiResponse<{
    id: string;
    username: string;
    email: string;
    profilePicture?: string;
    friendshipStatus: FriendStatus;
}[]>> => {
    const response = await api.get('/v1/api/users/search', { params: { q: query } });
    const respData = response.data;
    if (Array.isArray(respData)) {
        return { data: respData } as ApiResponse<{
            id: string;
            username: string;
            email: string;
            profilePicture?: string;
            friendshipStatus: FriendStatus;
        }[]>;
    }
    return respData as ApiResponse<{
        id: string;
        username: string;
        email: string;
        profilePicture?: string;
        friendshipStatus: FriendStatus;
    }[]>;
};

/**
 * Get friend suggestions
 */
export const getFriendSuggestions = async (limit = 10): Promise<ApiResponse<{
    id: string;
    username: string;
    email: string;
    profilePicture?: string;
    mutualFriends: number;
}[]>> => {
    const response = await api.get<ApiResponse<{
        id: string;
        username: string;
        email: string;
        profilePicture?: string;
        mutualFriends: number;
    }[]>>('/v1/api/friends/suggestions', { params: { limit } });
    return response.data;
};
