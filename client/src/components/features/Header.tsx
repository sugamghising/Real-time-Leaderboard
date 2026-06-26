import { useState, useRef, useEffect } from "react";
import { Bell, Wifi, WifiOff, Menu, Sun, Moon, Settings } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
import { useThemeStore } from "../../stores/themeStore";

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const socketContext = useSocket();
  const connected = socketContext?.connected || false;
  const { effective, mode, toggle, setMode } = useThemeStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions = [
    { value: "system" as const, label: "System" },
    { value: "light" as const, label: "Light" },
    { value: "dark" as const, label: "Dark" },
  ];

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
          {/* Theme controls */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-0">
              <button
                onClick={toggle}
                className="p-1.5 md:p-2 text-secondary hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] rounded-none"
                aria-label="Toggle theme"
              >
                {effective === "dark" ? (
                  <Moon className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Sun className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-1.5 md:p-2 text-secondary hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] rounded-none"
                aria-label="Theme settings"
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-surface border border-border shadow-sm z-50">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setMode(opt.value);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      mode === opt.value
                        ? "bg-accent text-white"
                        : "text-on-surface hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

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
          <button className="relative p-1.5 md:p-2 text-secondary hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] rounded-none">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
