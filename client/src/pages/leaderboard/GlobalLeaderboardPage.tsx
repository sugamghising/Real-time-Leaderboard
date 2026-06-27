import { useQuery } from "@tanstack/react-query";
import { useEffect, useContext } from "react";
import { Trophy } from "lucide-react";
import { getGlobalLeaderboard } from "../../api/endpoints/leaderboard";
import { queryClient } from "../../lib/queryClient";
import { SocketContext } from "../../contexts/SocketContext";
import type { ApiResponse, LeaderboardEntry } from "../../types";

export const GlobalLeaderboardPage = () => {
  const { socket } = useContext(SocketContext);

  const { data, isLoading, error } = useQuery<ApiResponse<LeaderboardEntry[]>>({
    queryKey: ["leaderboard", "global"],
    queryFn: () => getGlobalLeaderboard({ limit: 50, t: Date.now() }),
    staleTime: 0, // Force refetch on every query
    gcTime: 0, // Disable React Query cache
  });

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleLeaderboardUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard", "global"] });
    };

    socket.on("leaderboard:update", handleLeaderboardUpdate);

    return () => {
      socket.off("leaderboard:update", handleLeaderboardUpdate);
    };
  }, [socket]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-3">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-warning" />
            Global Leaderboard
          </h1>
        </div>
        <div className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6">
          <p className="text-error">
            Error loading leaderboard: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-3">
          <Trophy className="w-6 h-6 md:w-8 md:h-8 text-warning" />
          Global Leaderboard
        </h1>
      </div>

      <div className="bg-surface rounded-md border border-border shadow-sm">
        {isLoading ? (
          <p className="text-secondary text-center py-12">
            Loading leaderboard...
          </p>
        ) : !data || !data.data || data.data.length === 0 ? (
          <p className="text-secondary text-center py-12">
            No leaderboard data yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-[#FAFAFA] dark:bg-[#1E1E1E]">
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
                {data.data.map((entry: LeaderboardEntry, index: number) => (
                  <tr
                    key={entry.userId}
                    className={index < 3 ? "bg-[#FFFBEB] dark:bg-[#3A3020]" : ""}
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
