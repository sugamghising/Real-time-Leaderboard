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
    return <div className="text-center py-12 text-secondary">Loading...</div>;
  }

  if (!gameData) {
    return <div className="text-center py-12 text-secondary">Game not found</div>;
  }

  const GameComponent = gameComponent;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        to="/games"
        className="inline-flex items-center gap-2 text-accent hover:text-tertiary"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Games
      </Link>

      <div className="bg-surface rounded-md border border-border shadow-sm overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-on-surface">{gameData.title}</h1>
              <p className="text-secondary mt-2">{gameData.description}</p>
            </div>
            {!GameComponent && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-none hover:bg-[#1A1A1A]"
              >
                Submit Score
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm text-secondary">
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

      <div className="bg-surface rounded-md border border-border shadow-sm">
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            <h2 className="text-lg md:text-xl font-semibold text-on-surface">Top Players</h2>
          </div>
          <Link
            to={`/leaderboard/${gameId}`}
            className="text-accent hover:text-accent text-sm font-medium"
          >
            View Full Leaderboard
          </Link>
        </div>

        <div className="p-4 md:p-6">
          {leaderboardLoading ? (
            <p className="text-secondary text-center py-8">Loading...</p>
          ) : !leaderboard?.data || leaderboard.data.length === 0 ? (
            <p className="text-secondary text-center py-8">No scores yet</p>
          ) : (
            <div className="space-y-4">
              {leaderboard.data.map((entry: any, index: number) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-secondary">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-on-surface">
                        {entry.user?.username || "Unknown"}
                      </p>
                      <p className="text-sm text-secondary">{entry.score} points</p>
                    </div>
                  </div>
                  {index < 3 && <Trophy className="w-6 h-6 text-warning" />}
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
            className="inline-flex items-center gap-2 text-accent hover:text-accent text-sm"
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
    <div className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="text-lg md:text-xl font-semibold text-on-surface">Game Stats</h2>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <span className="block text-2xl font-bold text-primary">
            {stats.data.totalPlays}
          </span>
          <span className="text-sm text-secondary">Total Plays</span>
        </div>
        <div>
          <span className="block text-2xl font-bold text-success">
            {stats.data.bestScore}
          </span>
          <span className="text-sm text-secondary">Best Score</span>
        </div>
        <div>
          <span className="block text-2xl font-bold text-tertiary">
            {stats.data.averageScore}
          </span>
          <span className="text-sm text-secondary">Average Score</span>
        </div>
      </div>
    </div>
  );
};
