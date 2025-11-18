/**
 * Component props types
 */

import type { Game } from './game.types';
import type { LeaderboardEntry } from './leaderboard.types';
import type { Message } from './message.types';
import type { FriendWithDetails } from './friendship.types';

export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface GameCardProps extends BaseComponentProps {
    game: Game;
    onSelect?: (game: Game) => void;
}

export interface LeaderboardProps extends BaseComponentProps {
    gameId?: string;
    entries: LeaderboardEntry[];
    currentUserId?: string;
}

export interface MessageListProps extends BaseComponentProps {
    messages: Message[];
    currentUserId: string;
    onLoadMore?: () => void;
}

export interface FriendListProps extends BaseComponentProps {
    friends: FriendWithDetails[];
    onRemove?: (friendId: string) => void;
}
