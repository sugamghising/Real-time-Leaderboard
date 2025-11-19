import api from '../axios';
import type {
    LeaderboardEntry,
    TimeFrame,
    ApiResponse
} from '../../types';/**
 * Get leaderboard entries
 */
export const getLeaderboard = async (params?: {
    gameId?: string;
    timeFrame?: TimeFrame;
    limit?: number;
    offset?: number;
}): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get('/v1/api/leaderboard', { params });
    const respData = response.data;
    if (Array.isArray(respData)) {
        return { data: respData } as ApiResponse<LeaderboardEntry[]>;
    }
    return respData as ApiResponse<LeaderboardEntry[]>;
};

/**
 * Get global leaderboard
 */
export const getGlobalLeaderboard = async (params?: {
    timeFrame?: TimeFrame;
    limit?: number;
    [key: string]: any; // Allow additional params for cache busting
}): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>('/v1/api/leaderboard/global', { params });
    // normalize server responses: server may return a raw array (LeaderboardEntry[])
    // while client expects ApiResponse<T> ({ data: T }). Wrap arrays into the
    // ApiResponse shape so components can read `resp.data` reliably.
    const respData = response.data;
    if (Array.isArray(respData)) {
        return { data: respData } as ApiResponse<LeaderboardEntry[]>;
    }
    return respData as ApiResponse<LeaderboardEntry[]>;
};

/**
 * Get game-specific leaderboard
 */
export const getGameLeaderboard = async (
    gameId: string,
    params?: {
        timeFrame?: TimeFrame;
        limit?: number;
    }
): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get(`/v1/api/leaderboard/game/${gameId}`, { params });
    const respData = response.data;
    if (Array.isArray(respData)) {
        return { data: respData } as ApiResponse<LeaderboardEntry[]>;
    }
    return respData as ApiResponse<LeaderboardEntry[]>;
};

/**
 * Get user's rank
 */
export const getUserRank = async (
    userId: string,
    params?: {
        gameId?: string;
        timeFrame?: TimeFrame;
    }
): Promise<ApiResponse<{
    rank: number;
    totalPlayers: number;
    score: number;
    percentile: number;
}>> => {
    const response = await api.get<ApiResponse<{
        rank: number;
        totalPlayers: number;
        score: number;
        percentile: number;
    }>>(`/v1/api/leaderboard/user/${userId}/rank`, { params });
    return response.data;
};

/**
 * Get user's position in leaderboard
 */
export const getUserLeaderboardPosition = async (
    userId: string,
    gameId?: string
): Promise<ApiResponse<LeaderboardEntry | null>> => {
    const response = await api.get<ApiResponse<LeaderboardEntry | null>>(
        `/v1/api/leaderboard/user/${userId}/position`,
        { params: { gameId } }
    );
    return response.data;
};

/**
 * Get friends leaderboard
 */
export const getFriendsLeaderboard = async (params?: {
    gameId?: string;
    timeFrame?: TimeFrame;
    limit?: number;
}): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const response = await api.get('/v1/api/leaderboard/friends', { params });
    const respData = response.data;
    if (Array.isArray(respData)) {
        return { data: respData } as ApiResponse<LeaderboardEntry[]>;
    }
    return respData as ApiResponse<LeaderboardEntry[]>;
};
