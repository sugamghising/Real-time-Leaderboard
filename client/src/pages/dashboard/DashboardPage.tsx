import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Users,
  Gamepad2,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { getGlobalLeaderboard } from "../../api/endpoints/leaderboard";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: () => getGlobalLeaderboard({ limit: 5 }),
  });

  const stats = [
    { name: "Your Rank", value: "#-", icon: Trophy, color: "text-yellow-600" },
    { name: "Friends", value: "0", icon: Users, color: "text-blue-600" },
    {
      name: "Games Played",
      value: "0",
      icon: Gamepad2,
      color: "text-purple-600",
    },
    {
      name: "Win Rate",
      value: "--%",
      icon: TrendingUp,
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Top Players Preview */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Top Players</h2>
          <Link
            to="/leaderboard"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          {!leaderboard?.data || leaderboard.data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No leaderboard data yet
            </p>
          ) : (
            <div className="space-y-4">
              {leaderboard.data.slice(0, 5).map((entry: any, index: number) => (
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/games"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <Gamepad2 className="w-10 h-10 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Browse Games</h3>
          <p className="text-sm text-gray-600 mt-1">
            Explore available games and submit scores
          </p>
        </Link>

        <Link
          to="/friends"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <Users className="w-10 h-10 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Find Friends</h3>
          <p className="text-sm text-gray-600 mt-1">
            Connect with other players
          </p>
        </Link>

        <Link
          to="/chat"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <MessageSquare className="w-10 h-10 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
          <p className="text-sm text-gray-600 mt-1">Chat with your friends</p>
        </Link>
      </div>
    </div>
  );
};
