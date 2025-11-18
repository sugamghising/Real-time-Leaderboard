import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, getRefreshToken, clearTokens } from "../utils/storage";
import { login as loginApi, logout as logoutApi } from "../api/endpoints/auth";
import { jwtDecode } from "jwt-decode";

// ============================================
// TYPE DEFINITIONS
// ============================================

type User = {
  id: string;
  username?: string;
  role?: string;
};

interface JWTPayload {
  userId: string;
  sub?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize user from token on mount
    const initializeUser = () => {
      const token = getAccessToken();
      if (token) {
        try {
          // Decode JWT to get user info
          const payload = jwtDecode<JWTPayload>(token);
          setUser({
            id: payload.userId || payload.sub || "",
            role: payload.role,
          });
        } catch {
          // Token is invalid, clear it
          clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginApi({ email, password });

      // Tokens are already stored by the loginApi function
      // Decode the access token to get user info
      const payload = jwtDecode<JWTPayload>(data.accessToken);
      setUser({
        id: payload.userId || payload.sub || "",
        username: data.user.name,
        role: payload.role || data.user.role,
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        // Call logout API to revoke refresh token
        await logoutApi({ refreshToken });
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API failed:", error);
    } finally {
      // Always clear local state and redirect
      setUser(null);
      clearTokens();
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
