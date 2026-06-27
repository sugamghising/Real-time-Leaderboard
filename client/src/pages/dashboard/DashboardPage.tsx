import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Users,
  Gamepad2,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { getGlobalLeaderboard } from "../../api/endpoints/leaderboard";
import { getFriends } from "../../api/endpoints/friends";
import { useAuthStore } from "../../stores/authStore";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: () => getGlobalLeaderboard({ limit: 50 }),
  });

  const { user } = useAuthStore();
  const { data: friendsResp } = useQuery({
    queryKey: ["friends"],
    queryFn: () => getFriends(),
  });

  // derive dynamic stats
  const friendCount = friendsResp?.data ? friendsResp.data.length : 0;
  let yourRank = "#-";
  if (user && leaderboard?.data && leaderboard.data.length > 0) {
    const found = leaderboard.data.find(
      (e: any) =>
        e.userId === user.id ||
        e.user?.id === user.id ||
        e.user?.username === user.username
    );
    if (found && typeof found.rank !== "undefined") {
      yourRank = `#${found.rank}`;
    }
  }

  const stats = [
    {
      name: "Your Rank",
      value: yourRank,
      icon: Trophy,
      color: "text-warning",
    },
    {
      name: "Friends",
      value: String(friendCount),
      icon: Users,
      color: "text-primary",
    },
    {
      name: "Games Played",
      value: "0",
      icon: Gamepad2,
      color: "text-tertiary",
    },
    {
      name: "Win Rate",
      value: "--%",
      icon: TrendingUp,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">{stat.name}</p>
                <p className="text-2xl font-bold text-on-surface mt-1">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Top Players Preview */}
      <div className="bg-surface rounded-md border border-border shadow-sm">
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-on-surface">Top Players</h2>
          <Link
            to="/leaderboard"
            className="text-accent hover:text-accent text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="p-4 md:p-6">
          {!leaderboard?.data || leaderboard.data.length === 0 ? (
            <p className="text-secondary text-center py-8">
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
                    <span className="text-2xl font-bold text-secondary">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-on-surface">
                        {entry.user?.username || "Unknown"}
                      </p>
                      <p className="text-sm text-secondary">
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
          className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <Gamepad2 className="w-10 h-10 text-tertiary mb-3" />
          <h3 className="text-lg font-semibold text-on-surface">Browse Games</h3>
          <p className="text-sm text-secondary mt-1">
            Explore available games and submit scores
          </p>
        </Link>

        <Link
          to="/friends"
          className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <Users className="w-10 h-10 text-primary mb-3" />
          <h3 className="text-lg font-semibold text-on-surface">Find Friends</h3>
          <p className="text-sm text-secondary mt-1">
            Connect with other players
          </p>
        </Link>

        <Link
          to="/chat"
          className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <MessageSquare className="w-10 h-10 text-success mb-3" />
          <h3 className="text-lg font-semibold text-on-surface">Messages</h3>
          <p className="text-sm text-secondary mt-1">Chat with your friends</p>
        </Link>
      </div>
    </div>
  );
};
