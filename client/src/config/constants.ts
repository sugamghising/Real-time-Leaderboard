/**
 * Application constants and configuration
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Token Configuration
export const TOKEN_STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_LEADERBOARD_LIMIT = 50;

// Time frames
export const TIME_FRAMES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    ALL_TIME: 'all-time',
} as const;

// Game statuses
export const GAME_STATUSES = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

// Friendship statuses
export const FRIENDSHIP_STATUSES = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    NOT_FRIENDS: 'NOT_FRIENDS',
    YOU_SENT: 'YOU_SENT',
    THEY_SENT: 'THEY_SENT',
} as const;

// User roles
export const USER_ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
} as const;

// Socket Events
export const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',

    // Room management
    JOIN_GAME_ROOM: 'joinGameRoom',
    LEAVE_GAME_ROOM: 'leaveGameRoom',

    // Messages
    MESSAGE_NEW: 'message:new',
    MESSAGE_SENT: 'message:sent',
    MESSAGE_UNREAD_COUNT: 'message:unread_count',

    // Leaderboard
    LEADERBOARD_UPDATE: 'leaderboard:update',

    // Friends
    FRIEND_REQUEST: 'friend:request',
    FRIEND_ACCEPTED: 'friend:accepted',
    FRIEND_REJECTED: 'friend:rejected',
} as const;

// Route paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    GAMES: '/games',
    GAME_DETAIL: '/games/:id',
    LEADERBOARD: '/leaderboard',
    MESSAGES: '/messages',
    FRIENDS: '/friends',
    SETTINGS: '/settings',
} as const;

// Validation rules
export const VALIDATION = {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 100,
    MESSAGE_MAX_LENGTH: 1000,
    GAME_TITLE_MAX_LENGTH: 100,
    GAME_DESCRIPTION_MAX_LENGTH: 500,
} as const;

// UI Constants
export const UI = {
    TOAST_DURATION: 3000,
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 200,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    USER_EXISTS: 'A user with this email already exists.',
    GENERIC: 'Something went wrong. Please try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Successfully logged in!',
    REGISTER: 'Account created successfully!',
    LOGOUT: 'Successfully logged out.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    SCORE_SUBMITTED: 'Score submitted successfully!',
    MESSAGE_SENT: 'Message sent.',
    FRIEND_REQUEST_SENT: 'Friend request sent.',
    FRIEND_REQUEST_ACCEPTED: 'Friend request accepted.',
    GAME_CREATED: 'Game created successfully!',
} as const;
