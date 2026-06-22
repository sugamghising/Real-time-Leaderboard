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
  X,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useChatStore } from "../../stores/chatStore";
import { useFriendStore } from "../../stores/friendStore";
import { cn } from "../../lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Games", href: "/games", icon: Gamepad2 },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
    badge: "totalUnreadCount" as const,
  },
  { name: "Friends", href: "/friends", icon: Users, badge: "pendingCount" as const },
  { name: "Profile", href: "/profile", icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
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

  const handleNavClick = () => {
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
              <span className="text-white text-xl font-headline font-light tracking-tight">R</span>
            </div>
            <span className="text-lg font-headline font-light text-on-surface tracking-tight">Leaderboard</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-secondary hover:text-on-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const badgeValue = item.badge ? badges[item.badge] : 0;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-secondary hover:bg-[#F5F5F5]"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {badgeValue > 0 && (
                  <span className="bg-error text-white text-xs px-2 py-0.5 rounded-full">
                    {badgeValue}
                  </span>
                )}
              </NavLink>
            );
          })}

          {user?.role === "ADMIN" && (
            <NavLink
              to="/admin"
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mt-4",
                  isActive
                    ? "bg-tertiary text-white"
                    : "text-secondary hover:bg-[#F5F5F5]"
                )
              }
            >
              <Shield className="w-5 h-5" />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user?.username} avatar`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">
                {user?.username}
              </p>
              <p className="text-xs text-secondary truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-error hover:bg-[#FEF2F2] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
