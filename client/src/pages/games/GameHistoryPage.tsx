import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Trophy, Zap } from "lucide-react";
import { getSessions } from "../../api/endpoints/sessions";
import { getGameById } from "../../api/endpoints/games";
import type { GameSession } from "../../types/session.types";

export const GameHistoryPage = () => {
  const { gameId } = useParams<{ gameId: string }>();

  const { data: game } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => getGameById(gameId!),
    enabled: !!gameId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["sessions", gameId],
    queryFn: () => getSessions({ gameId, limit: 20 }),
    enabled: !!gameId,
  });

  const gameData = game?.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to={`/games/${gameId}`}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {gameData?.title || "Game"}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">Match History</h1>

      {isLoading ? (
        <p className="text-center py-8 text-gray-500">Loading...</p>
      ) : !data?.sessions || data.sessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No matches played yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.sessions.map((session: GameSession) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-gray-900">
                      Score: {session.score}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>
                      Duration: {session.duration ?? "?"}s
                    </span>
                    {session.meta && typeof session.meta === "object" && "cps" in session.meta && (
                      <span>
                        CPS: {String(session.meta.cps)}
                      </span>
                    )}
                    <span>
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`text-sm font-medium px-2 py-1 rounded ${
                  session.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {session.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
