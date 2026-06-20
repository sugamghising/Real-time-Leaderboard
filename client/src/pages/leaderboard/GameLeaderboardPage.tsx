import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { getGameLeaderboard } from "../../api/endpoints/leaderboard";
import { getGameById } from "../../api/endpoints/games";

export const GameLeaderboardPage = () => {
  const { gameId } = useParams<{ gameId: string }>();

  const { data: game } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => getGameById(gameId!),
    enabled: !!gameId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", "game", gameId],
    queryFn: () => getGameLeaderboard(gameId!, { limit: 50 }),
    enabled: !!gameId,
  });

  // defensive normalization of returned data
  const entries = Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray(data)
    ? (data as any)
    : [];

  // helpful debug log when developing locally
  // eslint-disable-next-line no-console
  console.debug("GameLeaderboardPage - entries:", entries);

  return (
    <div className="space-y-6">
      <Link
        to={`/games/${gameId}`}
        className="inline-flex items-center gap-2 text-accent hover:text-accent"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Game
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
          <Trophy className="w-8 h-8 text-warning" />
          {game?.data?.title || "Game"} Leaderboard
        </h1>
      </div>

      <div className="bg-surface rounded-md border border-border shadow-sm">
        {isLoading ? (
          <p className="text-secondary text-center py-12">
            Loading leaderboard...
          </p>
        ) : entries.length === 0 ? (
          <p className="text-secondary text-center py-12">No scores yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {entries.map((entry: any, index: number) => (
                  <tr
                    key={entry.userId}
                    className={index < 3 ? "bg-[#FFFBEB]" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-on-surface">
                          #{index + 1}
                        </span>
                        {index === 0 && (
                          <Trophy className="w-5 h-5 text-warning" />
                        )}
                        {index === 1 && (
                          <Trophy className="w-5 h-5 text-secondary" />
                        )}
                        {index === 2 && (
                          <Trophy className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-on-surface">
                        {entry.user?.username || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-on-surface">
                        {entry.score}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
