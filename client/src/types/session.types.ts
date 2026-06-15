export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  duration: number | null;
  status: "COMPLETED" | "ABORTED";
  meta: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface CreateSessionInput {
  gameId: string;
  score: number;
  duration?: number;
  status?: "COMPLETED" | "ABORTED";
  meta?: Record<string, unknown>;
}

export interface SessionStats {
  totalPlays: number;
  bestScore: number;
  bestPlayerId: string | null;
  averageScore: number;
}
