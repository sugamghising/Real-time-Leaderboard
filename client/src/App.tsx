import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import SocketProvider from "./providers/SocketProvider";
import { useAuthStore } from "./stores/authStore";

// Layouts
import { AuthLayout } from "./components/layout/AuthLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

// Dashboard Pages
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import UpdateProfilePage from "./pages/profile/UpdateProfilePage";

// Games Pages
import { GamesPage } from "./pages/games/GamesPage";
import { GameDetailPage } from "./pages/games/GameDetailPage";

// Leaderboard Pages
import { GlobalLeaderboardPage } from "./pages/leaderboard/GlobalLeaderboardPage";
import { GameLeaderboardPage } from "./pages/leaderboard/GameLeaderboardPage";

// Chat Pages
import { ChatPage } from "./pages/chat/ChatPage";

// Friends Pages
import { FriendsPage } from "./pages/friends/FriendsPage";

// Admin Pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminGamesPage } from "./pages/admin/AdminGamesPage";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<UpdateProfilePage />} />

              {/* Games Routes */}
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/:gameId" element={<GameDetailPage />} />

              {/* Leaderboard Routes */}
              <Route path="/leaderboard" element={<GlobalLeaderboardPage />} />
              <Route
                path="/leaderboard/:gameId"
                element={<GameLeaderboardPage />}
              />

              {/* Chat Route */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:userId" element={<ChatPage />} />

              {/* Friends Route */}
              <Route path="/friends" element={<FriendsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <AdminRoute>
                  <DashboardLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/games" element={<AdminGamesPage />} />
            </Route>

            {/* Redirect root to dashboard or login */}
            <Route
              path="/"
              element={
                <Navigate
                  to={
                    useAuthStore.getState().isAuthenticated
                      ? "/dashboard"
                      : "/login"
                  }
                  replace
                />
              }
            />

            {/* 404 - Redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
