/**
 * Error handling utilities
 */

import { ERROR_MESSAGES } from '../config/constants';
import type { ApiError } from '../types';

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
    // Axios error
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiError } };
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }
        if (typeof axiosError.response?.data?.error === 'string') {
            return axiosError.response.data.error;
        }
    }

    // Standard Error
    if (error instanceof Error) {
        return error.message;
    }

    // String error
    if (typeof error === 'string') {
        return error;
    }

    // Default
    return ERROR_MESSAGES.GENERIC;
};

/**
 * Check if error is an auth error
 */
export const isAuthError = (error: unknown): boolean => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        return axiosError.response?.status === 401 || axiosError.response?.status === 403;
    }
    return false;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const err = error as { message?: string };
        const msg = err.message?.toLowerCase() || '';
        return msg.includes('network') || msg.includes('timeout');
    }
    return false;
};/**
 * Log error to console (with optional external logging service)
 */
export const logError = (error: unknown, context?: string): void => {
    console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);
    // TODO: Send to external logging service (e.g., Sentry)
};
