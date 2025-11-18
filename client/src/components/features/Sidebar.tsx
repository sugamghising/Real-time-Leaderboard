import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Trophy,
  MessageSquare,
  Users,
  Gamepad2,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useChatStore } from "../../stores/chatStore";
import { useFriendStore } from "../../stores/friendStore";
import { cn } from "../../lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Games", href: "/games", icon: Gamepad2 },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
    badge: "totalUnreadCount",
  },
  { name: "Friends", href: "/friends", icon: Users, badge: "pendingCount" },
  { name: "Profile", href: "/profile", icon: Settings },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { totalUnreadCount } = useChatStore();
  const { pendingCount } = useFriendStore();

  const badges = {
    totalUnreadCount,
    pendingCount,
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h2>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const badgeValue = item.badge
            ? badges[item.badge as keyof typeof badges]
            : 0;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {badgeValue > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {badgeValue}
                </span>
              )}
            </NavLink>
          );
        })}

        {user?.role === "ADMIN" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mt-4",
                isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-700 hover:bg-gray-100"
              )
            }
          >
            <Shield className="w-5 h-5" />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
