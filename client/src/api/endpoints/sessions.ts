import api from "../axios";
import type { CreateSessionInput, GameSession, SessionStats } from "../../types/session.types";

export const createSession = async (data: CreateSessionInput) => {
  const response = await api.post<{ success: boolean; data: GameSession }>("/v1/api/sessions", data);
  return response.data;
};

export const getSessions = async (params: {
  gameId?: string;
  limit?: number;
  cursor?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    sessions: GameSession[];
    nextCursor: string | null;
    hasMore: boolean;
  }>("/v1/api/sessions", { params });
  return response.data;
};

export const getSessionStats = async (gameId: string) => {
  const response = await api.get<{ success: boolean; data: SessionStats }>(
    `/v1/api/sessions/stats/${gameId}`
  );
  return response.data;
};
