import { Bell, Wifi, WifiOff, Menu } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const socketContext = useSocket();
  const connected = socketContext?.connected || false;

  return (
    <header className="bg-surface border-b border-border px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1 text-secondary hover:text-on-surface transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-on-surface">Welcome Back!</h2>
            <p className="text-xs md:text-sm text-secondary">
              Track your gaming achievements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {connected ? (
              <>
                <Wifi className="w-4 h-4 md:w-5 md:h-5 text-success" />
                <span className="hidden sm:inline text-xs md:text-sm text-success">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 md:w-5 md:h-5 text-error" />
                <span className="hidden sm:inline text-xs md:text-sm text-error">Disconnected</span>
              </>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-1.5 md:p-2 text-secondary hover:bg-[#F5F5F5] rounded-none">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
