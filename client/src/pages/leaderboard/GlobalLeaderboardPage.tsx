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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Global Leaderboard
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <p className="text-red-500">
            Error loading leaderboard: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Global Leaderboard
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <p className="text-gray-500 text-center py-12">
            Loading leaderboard...
          </p>
        ) : !data || !data.data || data.data.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No leaderboard data yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((entry: LeaderboardEntry, index: number) => (
                  <tr
                    key={entry.userId}
                    className={index < 3 ? "bg-yellow-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-700">
                          #{index + 1}
                        </span>
                        {index === 0 && (
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        )}
                        {index === 1 && (
                          <Trophy className="w-5 h-5 text-gray-400" />
                        )}
                        {index === 2 && (
                          <Trophy className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {entry.user?.username || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
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
