/**
 * Centralized TypeScript type definitions for the Real-Time Leaderboard application
 * All types are organized by domain in separate files and re-exported here
 * 
 * Type Organization:
 * - common.types.ts       - Enums, utility types, common constants
 * - user.types.ts         - User entities and profiles
 * - auth.types.ts         - Authentication and JWT types
 * - game.types.ts         - Game entities and operations
 * - score.types.ts        - Score submissions and rankings
 * - leaderboard.types.ts  - Leaderboard entries and rankings
 * - message.types.ts      - Messaging and conversations
 * - friendship.types.ts   - Friend system and relationships
 * - socket.types.ts       - Socket.IO event types
 * - api.types.ts          - API responses and pagination
 * - form.types.ts         - Form data structures
 * - context.types.ts      - React Context types
 * - component.types.ts    - Component props types
 */

// Common types and enums
export * from './common.types';

// Domain-specific types
export * from './user.types';
export * from './auth.types';
export * from './game.types';
export * from './score.types';
export * from './leaderboard.types';
export * from './message.types';
export * from './friendship.types';

// Technical types
export * from './socket.types';
export * from './api.types';
export * from './form.types';
export * from './context.types';
export * from './component.types';
