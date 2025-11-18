import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy, Calendar, Plus } from "lucide-react";
import { getGameById } from "../../api/endpoints/games";
import { getGameLeaderboard } from "../../api/endpoints/leaderboard";
import { SubmitScoreModal } from "../../components/features/SubmitScoreModal";
import { useState } from "react";

export const GameDetailPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [showSubmitModal, setShowSubmitModal] = useState(false);

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

  if (gameLoading) {
    return <div>Loading...</div>;
  }

  if (!game || !game.data) {
    return <div>Game not found</div>;
  }

  const gameData = game.data;

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
              <h1 className="text-3xl font-bold text-gray-900">
                {gameData.title}
              </h1>
              <p className="text-gray-600 mt-2">{gameData.description}</p>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Submit Score
            </button>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Released: {new Date(gameData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Top Players</h2>
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
                      <p className="text-sm text-gray-500">
                        {entry.score} points
                      </p>
                    </div>
                  </div>
                  {index < 3 && <Trophy className="w-6 h-6 text-yellow-500" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Score Modal */}
      {gameData && (
        <SubmitScoreModal
          game={gameData}
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
};
