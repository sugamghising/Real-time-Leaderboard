/**
 * Authentication-related types
 */

import type { UserRole } from './common.types';

export interface JWTPayload {
    userId: string;
    sub?: string;
    role?: string;
    iat?: number;
    exp?: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        userId: string;
        name: string;
        email: string;
        role: UserRole;
    };
}

export interface RegisterResponse {
    message: string;
    user: {
        id: string;
        username: string;
        email: string;
        role: UserRole;
    };
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
}

export interface LogoutRequest {
    refreshToken: string;
}

export interface LogoutResponse {
    message: string;
}
