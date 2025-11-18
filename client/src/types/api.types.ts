/**
 * API response types
 */

export interface ApiError {
    error: string | object;
    message?: string;
}

export interface ApiSuccess<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface ApiResponse<T = unknown> {
    success?: boolean;
    message?: string;
    data?: T;
}

export interface PaginatedResponse<T> {
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
    total?: number;
    page?: number;
    limit?: number;
}
