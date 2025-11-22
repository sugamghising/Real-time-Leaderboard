import api from '../axios';
import type {
    User,
    UserProfile,
    UpdateProfileData,
    ApiResponse
} from '../../types';

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/v1/api/users/me');
    return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>(`/v1/api/users/${userId}`);
    return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, data: UpdateProfileData): Promise<ApiResponse<User>> => {
    const response = await api.put(`/v1/api/users/${userId}`, data);
    const respData = response.data;
    // server returns { message, user }
    if (respData && respData.user) {
        return { data: respData.user } as ApiResponse<User>;
    }
    return respData as ApiResponse<User>;
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file: File): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post('/v1/api/users/profile-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    const respData = response.data;
    if (respData && respData.user) {
        return { data: respData.user } as ApiResponse<User>;
    }
    return respData as ApiResponse<User>;
};

/**
 * Get user statistics
 */
export const getUserStats = async (userId: string): Promise<ApiResponse<{
    totalGames: number;
    totalScore: number;
    rank: number;
    achievements: number;
}>> => {
    const response = await api.get<ApiResponse<{
        totalGames: number;
        totalScore: number;
        rank: number;
        achievements: number;
    }>>(`/v1/api/users/${userId}/stats`);
    return response.data;
};

/**
 * Admin: Get all users
 */
export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/v1/api/users');
    const resp = response.data;
    // server may return the raw array or an ApiResponse wrapper
    if (Array.isArray(resp)) {
        return { data: resp } as unknown as ApiResponse<User[]>;
    }
    if (resp && typeof resp === 'object' && 'data' in resp) {
        return resp as ApiResponse<User[]>;
    }
    // fallback: empty
    return { data: [] } as ApiResponse<User[]>;
};

/**
 * Admin: Update any user (role, displayName, avatarUrl, etc.)
 */
export const adminUpdateUser = async (userId: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/v1/api/users/${userId}`, data);
    const respData = response.data;
    if (respData && respData.user) {
        return { data: respData.user } as ApiResponse<User>;
    }
    return respData as ApiResponse<User>;
};

/**
 * Admin: Delete a user
 */
export const adminDeleteUser = async (userId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/v1/api/users/${userId}`);
    return response.data as ApiResponse<null>;
};
