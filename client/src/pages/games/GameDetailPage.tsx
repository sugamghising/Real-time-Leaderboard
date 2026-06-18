import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy, Calendar, History, BarChart3 } from "lucide-react";
import { getGameById } from "../../api/endpoints/games";
import { getGameLeaderboard } from "../../api/endpoints/leaderboard";
import { getSessionStats } from "../../api/endpoints/sessions";
import { SubmitScoreModal } from "../../components/features/SubmitScoreModal";
import { ClickSpeed } from "../../components/games/ClickSpeed";
import { ReactionTime } from "../../components/games/ReactionTime";
import { NumberMemory } from "../../components/games/NumberMemory";
import { useState, useMemo } from "react";

export const GameDetailPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => getGameById(gameId!),
    enabled: !!gameId,
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard", "game", gameId],
    queryFn: () => getGameLeaderboard(gameId!, { limit: 10 }),
    enabled: !!gameId,
  });

  const gameData = game?.data;

  const gameComponent = useMemo(() => {
    if (!gameData?.slug) return null;
    switch (gameData.slug) {
      case "click-speed":
        return ClickSpeed;
      case "reaction-time":
        return ReactionTime;
      case "number-memory":
        return NumberMemory;
      default:
        return null;
    }
  }, [gameData?.slug]);

  if (gameLoading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (!gameData) {
    return <div className="text-center py-12 text-gray-500">Game not found</div>;
  }

  const GameComponent = gameComponent;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        to="/games"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Games
      </Link>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{gameData.title}</h1>
              <p className="text-gray-600 mt-2">{gameData.description}</p>
            </div>
            {!GameComponent && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Score
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Released: {new Date(gameData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {GameComponent && gameId && (
        <GameComponent
          gameId={gameId}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["leaderboard", "game", gameId] });
            queryClient.invalidateQueries({ queryKey: ["leaderboard", "global"] });
            queryClient.invalidateQueries({ queryKey: ["session-stats", gameId] });
            queryClient.invalidateQueries({ queryKey: ["sessions", gameId] });
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Top Players</h2>
          </div>
          <Link
            to={`/leaderboard/${gameId}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View Full Leaderboard
          </Link>
        </div>

        <div className="p-6">
          {leaderboardLoading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : !leaderboard?.data || leaderboard.data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No scores yet</p>
          ) : (
            <div className="space-y-4">
              {leaderboard.data.map((entry: any, index: number) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {entry.user?.username || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">{entry.score} points</p>
                    </div>
                  </div>
                  {index < 3 && <Trophy className="w-6 h-6 text-yellow-500" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {GameComponent && (
        <GameStatsSection gameId={gameId!} />
      )}

      {GameComponent && (
        <div className="text-center">
          <Link
            to={`/games/${gameId}/history`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <History className="w-4 h-4" />
            View Match History
          </Link>
        </div>
      )}

      {gameData && !GameComponent && (
        <SubmitScoreModal
          game={gameData}
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
};

const GameStatsSection = ({ gameId }: { gameId: string }) => {
  const { data: stats } = useQuery({
    queryKey: ["session-stats", gameId],
    queryFn: () => getSessionStats(gameId),
    enabled: !!gameId,
  });

  if (!stats?.data) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">Game Stats</h2>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <span className="block text-2xl font-bold text-blue-600">
            {stats.data.totalPlays}
          </span>
          <span className="text-sm text-gray-500">Total Plays</span>
        </div>
        <div>
          <span className="block text-2xl font-bold text-green-600">
            {stats.data.bestScore}
          </span>
          <span className="text-sm text-gray-500">Best Score</span>
        </div>
        <div>
          <span className="block text-2xl font-bold text-purple-600">
            {stats.data.averageScore}
          </span>
          <span className="text-sm text-gray-500">Average Score</span>
        </div>
      </div>
    </div>
  );
};
