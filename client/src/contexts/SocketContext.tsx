import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../utils/storage";
import { useAuth } from "./AuthContext";
import type {
  SocketMessageNewEvent,
  SocketMessageSentEvent,
  SocketUnreadCountEvent,
  SocketLeaderboardUpdateEvent,
  SocketFriendRequestEvent,
  SocketFriendAcceptedEvent,
  SocketFriendRejectedEvent,
} from "../types";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;

  // Room Management
  joinGameRoom: (gameId: string) => void;
  leaveGameRoom: (gameId: string) => void;

  // Event Listeners
  onMessageNew: (callback: (message: SocketMessageNewEvent) => void) => void;
  onMessageSent: (callback: (message: SocketMessageSentEvent) => void) => void;
  onUnreadCount: (callback: (data: SocketUnreadCountEvent) => void) => void;
  onLeaderboardUpdate: (
    callback: (data: SocketLeaderboardUpdateEvent) => void
  ) => void;
  onFriendRequest: (callback: (data: SocketFriendRequestEvent) => void) => void;
  onFriendAccepted: (
    callback: (data: SocketFriendAcceptedEvent) => void
  ) => void;
  onFriendRejected: (
    callback: (data: SocketFriendRejectedEvent) => void
  ) => void;

  // Remove Listeners
  offMessageNew: (callback?: (message: SocketMessageNewEvent) => void) => void;
  offMessageSent: (
    callback?: (message: SocketMessageSentEvent) => void
  ) => void;
  offUnreadCount: (callback?: (data: SocketUnreadCountEvent) => void) => void;
  offLeaderboardUpdate: (
    callback?: (data: SocketLeaderboardUpdateEvent) => void
  ) => void;
  offFriendRequest: (
    callback?: (data: SocketFriendRequestEvent) => void
  ) => void;
  offFriendAccepted: (
    callback?: (data: SocketFriendAcceptedEvent) => void
  ) => void;
  offFriendRejected: (
    callback?: (data: SocketFriendRejectedEvent) => void
  ) => void;
}

// ============================================
// CONTEXT CREATION
// ============================================

// Export the simple context for the new provider
export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

// Old context for legacy provider
const SocketContextLegacy = createContext<SocketContextType | null>(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    // Create socket connection
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // ============================================
  // ROOM MANAGEMENT
  // ============================================

  const joinGameRoom = useCallback((gameId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("joinGameRoom", gameId);
      console.log(`Joined game room: ${gameId}`);
    }
  }, []);

  const leaveGameRoom = useCallback((gameId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leaveGameRoom", gameId);
      console.log(`Left game room: ${gameId}`);
    }
  }, []);

  // ============================================
  // EVENT LISTENERS (ON)
  // ============================================

  const onMessageNew = useCallback(
    (callback: (message: SocketMessageNewEvent) => void) => {
      if (socketRef.current) {
        socketRef.current.on("message:new", callback);
      }
    },
    []
  );

  const onMessageSent = useCallback(
    (callback: (message: SocketMessageSentEvent) => void) => {
      if (socketRef.current) {
        socketRef.current.on("message:sent", callback);
      }
    },
    []
  );

  const onUnreadCount = useCallback(
    (callback: (data: SocketUnreadCountEvent) => void) => {
      if (socketRef.current) {
        socketRef.current.on("message:unread_count", callback);
      }
    },
    []
  );

  const onLeaderboardUpdate = useCallback(
    (callback: (data: SocketLeaderboardUpdateEvent) => void) => {
      if (socketRef.current) {
        socketRef.current.on("leaderboard:update", callback);
      }
    },
    []
  );

  const onFriendRequest = useCallback(
    (callback: (data: SocketFriendRequestEvent) => void) => {
      if (socketRef.current) {
        socketRef.current.on("friend:request", callback);
      }
    },
    []
  );

  const onFriendAccepted = useCallback(
    (callback: (data: SocketFriendAcceptedEvent) => void) => {
      if (socketRef.current) {
        socketRef.current.on("friend:accepted", callback);
      }
    },
    []
  );

  const onFriendRejected = useCallback(
    (callback: (data: SocketFriendRejectedEvent) => void) => {
      if (socketRef.current) {
        socketRef.current.on("friend:rejected", callback);
      }
    },
    []
  );

  // ============================================
  // EVENT LISTENERS (OFF)
  // ============================================

  const offMessageNew = useCallback(
    (callback?: (message: SocketMessageNewEvent) => void) => {
      if (socketRef.current) {
        if (callback) {
          socketRef.current.off("message:new", callback);
        } else {
          socketRef.current.off("message:new");
        }
      }
    },
    []
  );

  const offMessageSent = useCallback(
    (callback?: (message: SocketMessageSentEvent) => void) => {
      if (socketRef.current) {
        if (callback) {
          socketRef.current.off("message:sent", callback);
        } else {
          socketRef.current.off("message:sent");
        }
      }
    },
    []
  );

  const offUnreadCount = useCallback(
    (callback?: (data: SocketUnreadCountEvent) => void) => {
      if (socketRef.current) {
        if (callback) {
          socketRef.current.off("message:unread_count", callback);
        } else {
          socketRef.current.off("message:unread_count");
        }
      }
    },
    []
  );

  const offLeaderboardUpdate = useCallback(
    (callback?: (data: SocketLeaderboardUpdateEvent) => void) => {
      if (socketRef.current) {
        if (callback) {
          socketRef.current.off("leaderboard:update", callback);
        } else {
          socketRef.current.off("leaderboard:update");
        }
      }
    },
    []
  );

  const offFriendRequest = useCallback(
    (callback?: (data: SocketFriendRequestEvent) => void) => {
      if (socketRef.current) {
        if (callback) {
          socketRef.current.off("friend:request", callback);
        } else {
          socketRef.current.off("friend:request");
        }
      }
    },
    []
  );

  const offFriendAccepted = useCallback(
    (callback?: (data: SocketFriendAcceptedEvent) => void) => {
      if (socketRef.current) {
        if (callback) {
          socketRef.current.off("friend:accepted", callback);
        } else {
          socketRef.current.off("friend:accepted");
        }
      }
    },
    []
  );

  const offFriendRejected = useCallback(
    (callback?: (data: SocketFriendRejectedEvent) => void) => {
      if (socketRef.current) {
        if (callback) {
          socketRef.current.off("friend:rejected", callback);
        } else {
          socketRef.current.off("friend:rejected");
        }
      }
    },
    []
  );

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: SocketContextType = {
    socket,
    connected,
    joinGameRoom,
    leaveGameRoom,
    onMessageNew,
    onMessageSent,
    onUnreadCount,
    onLeaderboardUpdate,
    onFriendRequest,
    onFriendAccepted,
    onFriendRejected,
    offMessageNew,
    offMessageSent,
    offUnreadCount,
    offLeaderboardUpdate,
    offFriendRequest,
    offFriendAccepted,
    offFriendRejected,
  };

  return (
    <SocketContextLegacy.Provider value={value}>
      {children}
    </SocketContextLegacy.Provider>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================

export const useSocket = () => {
  const context = useContext(SocketContextLegacy);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
