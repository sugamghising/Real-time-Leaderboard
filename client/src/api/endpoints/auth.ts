import api from "../axios";
import { setAccessToken, setRefreshToken, clearTokens } from "../../utils/storage";


interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

interface RefreshRequest {
    refreshToken: string;
}

interface LogoutRequest {
    refreshToken: string;
}

interface User {
    userId: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    displayName?: string | null;
    avatarUrl?: string | null;
}

interface AuthResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: User;
}

interface RegisterResponse {
    message: string;
    user: {
        id: string;
        username: string;
        email: string;
        role: "USER" | "ADMIN";
    };
}

interface RefreshResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
}

interface LogoutResponse {
    message: string;
}


/**
 * Register a new user account
 * POST /v1/api/auth/register
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>("/v1/api/auth/register", data);
    return response.data;
};

/**
 * Login with email and password
 * POST /v1/api/auth/login
 * Stores access and refresh tokens in localStorage
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/v1/api/auth/login", data);
    const { accessToken, refreshToken } = response.data;

    // Store tokens in localStorage
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    return response.data;
};

/**
 * Refresh access token using refresh token
 * POST /v1/api/auth/refresh
 * Automatically called by axios interceptor on 401 errors
 */
export const refreshToken = async (data: RefreshRequest): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>("/v1/api/auth/refresh", data);
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update tokens in localStorage
    setAccessToken(accessToken);
    setRefreshToken(newRefreshToken);

    return response.data;
};

/**
 * Logout and revoke refresh token
 * POST /v1/api/auth/logout
 * Clears tokens from localStorage
 */
export const logout = async (data: LogoutRequest): Promise<LogoutResponse> => {
    try {
        const response = await api.post<LogoutResponse>("/v1/api/auth/logout", data);
        return response.data;
    } finally {
        clearTokens();
    }
};



/**
 * Check if user is authenticated (has valid access token)
 */
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("access_token");
    return !!token;
};

/**
 * Get current user info from token (if needed)
 * Note: In production, decode JWT or fetch from /v1/api/users/me endpoint
 */
// export const getCurrentUser = (): User | null => {
    
//     return null;
// };