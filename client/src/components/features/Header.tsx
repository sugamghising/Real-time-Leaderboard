import { Bell, Wifi, WifiOff } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";

export const Header = () => {
  const socketContext = useSocket();
  const connected = socketContext?.connected || false;

  return (
    <header className="bg-surface border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Welcome Back!</h2>
          <p className="text-sm text-secondary">
            Track your gaming achievements
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="w-5 h-5 text-success" />
                <span className="text-sm text-success">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-error" />
                <span className="text-sm text-error">Disconnected</span>
              </>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-secondary hover:bg-[#F5F5F5] rounded-none">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
