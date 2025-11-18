/**
 * Common types and enums used across the application
 */

// ============================================
// ENUMS (as const objects for TypeScript compatibility)
// ============================================

export const UserRole = {
    USER: "USER",
    ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const FriendshipStatus = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
} as const;

export type FriendshipStatus = (typeof FriendshipStatus)[keyof typeof FriendshipStatus];

// ============================================
// COMMON TYPES
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;

export type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make all properties of T mutable (remove readonly)
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

// Deep partial - makes all nested properties optional
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
