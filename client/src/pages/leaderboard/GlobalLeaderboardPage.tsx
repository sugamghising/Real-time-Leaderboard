import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Trophy } from "lucide-react";
import { getGlobalLeaderboard } from "../../api/endpoints/leaderboard";
import { queryClient } from "../../lib/queryClient";

export const GlobalLeaderboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: () => getGlobalLeaderboard({ limit: 50 }),
  });

  // Listen for real-time updates
  useEffect(() => {
    const handleLeaderboardUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard", "global"] });
    };

    window.addEventListener("leaderboard:update", handleLeaderboardUpdate);

    return () => {
      window.removeEventListener("leaderboard:update", handleLeaderboardUpdate);
    };
  }, []);

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
        ) : !data?.data || data.data.length === 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((entry: any, index: number) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {entry.gamesPlayed || 0}
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
