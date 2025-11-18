/**
 * Form data types
 */

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface UpdateProfileFormData {
    displayName?: string;
    avatarUrl?: string;
}

export interface CreateGameFormData {
    slug: string;
    title: string;
    description?: string;
    metadata?: string; // JSON string
    image?: FileList;
}

export interface SubmitScoreFormData {
    score: number;
    meta?: Record<string, unknown>;
}

export interface SendMessageFormData {
    toUserId: string;
    content: string;
}
