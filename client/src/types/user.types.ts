/**
 * User-related types
 */

import type { UserRole } from './common.types';

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    displayName?: string | null;
    avatarUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    role: UserRole;
}

export interface UpdateUserInput {
    displayName?: string;
    avatarUrl?: string;
}

export type UpdateProfileData = UpdateUserInput;
