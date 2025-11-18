import { Shield, Users, Gamepad2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminDashboardPage = () => {
  const stats = [
    { name: "Total Users", value: "0", icon: Users, color: "text-blue-600" },
    {
      name: "Total Games",
      value: "0",
      icon: Gamepad2,
      color: "text-purple-600",
    },
    {
      name: "Total Scores",
      value: "0",
      icon: Trophy,
      color: "text-yellow-600",
    },
    { name: "Active Today", value: "0", icon: Users, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/games"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <Gamepad2 className="w-10 h-10 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Manage Games</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add, edit, or remove games from the platform
          </p>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <Users className="w-10 h-10 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
          <p className="text-sm text-gray-600 mt-1">
            View and manage user accounts (Coming soon)
          </p>
        </div>
      </div>
    </div>
  );
};
