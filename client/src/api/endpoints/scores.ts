import api from '../axios';
import type {
    Score,
    ScoreWithUser,
    SubmitScoreData,
    CreateScoreResponse,
    ApiResponse,
    PaginatedResponse
} from '../../types';

/**
 * Submit a score
 */
export const submitScore = async (gameId: string, data: SubmitScoreData): Promise<ApiResponse<CreateScoreResponse>> => {
    const response = await api.post<ApiResponse<CreateScoreResponse>>(`/v1/api/scores/${gameId}`, data);
    return response.data;
};

/**
 * Get score by ID
 */
export const getScoreById = async (scoreId: string): Promise<ApiResponse<ScoreWithUser>> => {
    const response = await api.get<ApiResponse<ScoreWithUser>>(`/v1/api/scores/${scoreId}`);
    return response.data;
};

/**
 * Get scores for a game
 */
export const getGameScores = async (
    gameId: string,
    params?: {
        page?: number;
        limit?: number;
    }
): Promise<PaginatedResponse<ScoreWithUser>> => {
    const response = await api.get<PaginatedResponse<ScoreWithUser>>(
        `/v1/api/games/${gameId}/scores`,
        { params }
    );
    return response.data;
};

/**
 * Get user's scores
 */
export const getUserScores = async (
    userId: string,
    params?: {
        gameId?: string;
        page?: number;
        limit?: number;
    }
): Promise<PaginatedResponse<Score>> => {
    const response = await api.get<PaginatedResponse<Score>>(
        `/v1/api/users/${userId}/scores`,
        { params }
    );
    return response.data;
};

/**
 * Get user's best score for a game
 */
export const getUserBestScore = async (
    userId: string,
    gameId: string
): Promise<ApiResponse<Score | null>> => {
    const response = await api.get<ApiResponse<Score | null>>(
        `/v1/api/users/${userId}/scores/best`,
        { params: { gameId } }
    );
    return response.data;
};

/**
 * Delete a score
 */
export const deleteScore = async (scoreId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/v1/api/scores/${scoreId}`);
    return response.data;
};

/**
 * Get high scores across all games
 */
export const getHighScores = async (params?: {
    gameId?: string;
    limit?: number;
}): Promise<ApiResponse<ScoreWithUser[]>> => {
    const response = await api.get<ApiResponse<ScoreWithUser[]>>('/v1/api/scores/high-scores', { params });
    return response.data;
};
