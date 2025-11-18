import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🏆 Leaderboard</h1>
          <p className="text-gray-600 mt-2">Real-time gaming platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
