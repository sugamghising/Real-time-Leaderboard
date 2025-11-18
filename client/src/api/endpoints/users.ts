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
export const updateProfile = async (data: UpdateProfileData): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>('/v1/api/users/profile', data);
    return response.data;
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file: File): Promise<ApiResponse<{ profilePicture: string }>> => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post<ApiResponse<{ profilePicture: string }>>(
        '/v1/api/users/profile-picture',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
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
