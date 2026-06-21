import { Shield, Users, Gamepad2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminDashboardPage = () => {
  const stats = [
    { name: "Total Users", value: "0", icon: Users, color: "text-primary" },
    {
      name: "Total Games",
      value: "0",
      icon: Gamepad2,
      color: "text-tertiary",
    },
    {
      name: "Total Scores",
      value: "0",
      icon: Trophy,
      color: "text-warning",
    },
    { name: "Active Today", value: "0", icon: Users, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 md:w-8 md:h-8 text-tertiary" />
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Admin Dashboard</h1>
      </div>

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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/games"
          className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <Gamepad2 className="w-10 h-10 text-tertiary mb-3" />
          <h3 className="text-lg font-semibold text-on-surface">Manage Games</h3>
          <p className="text-sm text-secondary mt-1">
            Add, edit, or remove games from the platform
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
        >
          <Users className="w-10 h-10 text-primary mb-3" />
          <h3 className="text-lg font-semibold text-on-surface">Manage Users</h3>
          <p className="text-sm text-secondary mt-1">
            View and manage user accounts
          </p>
        </Link>
      </div>
    </div>
  );
};
