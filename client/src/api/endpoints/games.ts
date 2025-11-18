import api from '../axios';
import type {
    Game,
    GameWithParticipants,
    CreateGameData,
    JoinGameData,
    GameStatus,
    GameSettings,
    ApiResponse,
    PaginatedResponse
} from '../../types';

/**
 * Create a new game
 */
export const createGame = async (data: CreateGameData): Promise<ApiResponse<Game>> => {
    const response = await api.post<ApiResponse<Game>>('/v1/api/games', data);
    return response.data;
};

/**
 * Get game by ID
 */
export const getGameById = async (gameId: string): Promise<ApiResponse<GameWithParticipants>> => {
    const response = await api.get<ApiResponse<GameWithParticipants>>(`/v1/api/games/${gameId}`);
    return response.data;
};

/**
 * Get all games with filters
 */
export const getGames = async (params?: {
    status?: GameStatus;
    page?: number;
    limit?: number;
}): Promise<PaginatedResponse<Game>> => {
    const response = await api.get<PaginatedResponse<Game>>('/v1/api/games', { params });
    return response.data;
};

/**
 * Get user's games
 */
export const getUserGames = async (userId: string): Promise<ApiResponse<Game[]>> => {
    const response = await api.get<ApiResponse<Game[]>>(`/v1/api/users/${userId}/games`);
    return response.data;
};

/**
 * Join a game
 */
export const joinGame = async (gameId: string, data?: JoinGameData): Promise<ApiResponse<Game>> => {
    const response = await api.post<ApiResponse<Game>>(`/v1/api/games/${gameId}/join`, data);
    return response.data;
};

/**
 * Leave a game
 */
export const leaveGame = async (gameId: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/v1/api/games/${gameId}/leave`);
    return response.data;
};

/**
 * Start a game (host only)
 */
export const startGame = async (gameId: string): Promise<ApiResponse<Game>> => {
    const response = await api.post<ApiResponse<Game>>(`/v1/api/games/${gameId}/start`);
    return response.data;
};

/**
 * End a game (host only)
 */
export const endGame = async (gameId: string): Promise<ApiResponse<Game>> => {
    const response = await api.post<ApiResponse<Game>>(`/v1/api/games/${gameId}/end`);
    return response.data;
};

/**
 * Update game settings (host only)
 */
export const updateGameSettings = async (
    gameId: string,
    settings: Partial<GameSettings>
): Promise<ApiResponse<Game>> => {
    const response = await api.patch<ApiResponse<Game>>(`/v1/api/games/${gameId}/settings`, settings);
    return response.data;
};

/**
 * Delete a game (host only)
 */
export const deleteGame = async (gameId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/v1/api/games/${gameId}`);
    return response.data;
};

/**
 * Get active games count
 */
export const getActiveGamesCount = async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/v1/api/games/active/count');
    return response.data;
};
