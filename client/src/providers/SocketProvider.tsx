/**
 * Enhanced Socket Provider with Zustand Integration
 */

import { useEffect, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";
import { useChatStore } from "../stores/chatStore";
import { useFriendStore } from "../stores/friendStore";
import { SocketContext } from "../contexts/SocketContext";
import type { Message, Friendship } from "../types";

interface SocketProviderProps {
  children: ReactNode;
}

// Main provider component - default export for fast refresh compatibility
export default function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const { user, accessToken } = useAuthStore();
  const { addMessage, incrementUnread } = useChatStore();
  const { addFriendRequest, incrementPendingCount } = useFriendStore();

  useEffect(() => {
    // Cleanup existing socket if user logs out
    if (!user || !accessToken) {
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    // Debug: log whether we have a token (truncate for safety)
    // NOTE: this log is only for local debugging and should be removed in production
    if (!accessToken) {
      console.warn(
        "SocketProvider: no access token available — socket will not authenticate"
      );
    } else {
      // show a short prefix to confirm token presence without printing full secret
      // eslint-disable-next-line no-console
      console.debug(
        "SocketProvider: access token present (prefix)",
        accessToken.slice(0, 12) + "..."
      );
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      setSocket(newSocket);
      setConnected(true);
    });

    newSocket.on("connect_error", (error) => {
      // Log the full error object to capture server-sent reason
      console.error("Socket connection error:", error);
      setConnected(false);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    // Real-time message handling
    newSocket.on("message:new", (data: Message) => {
      console.log("📨 New message:", data);
      addMessage(data.fromUserId, data);
      incrementUnread(data.fromUserId);
    });

    // Friend request handling
    newSocket.on("friend:request", (data: { friendship: Friendship }) => {
      console.log("👥 Friend request:", data);
      addFriendRequest(data.friendship);
      incrementPendingCount();
    });

    newSocket.on("friend:accepted", (data: { friendship: Friendship }) => {
      console.log("✅ Friend request accepted:", data);
      // You can add toast notification here
    });

    // Leaderboard updates
    newSocket.on("leaderboard:update", (data) => {
      console.log("🏆 Leaderboard updated:", data);
      // Trigger React Query refetch via custom event
      window.dispatchEvent(
        new CustomEvent("leaderboard:update", { detail: data })
      );
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessToken]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
