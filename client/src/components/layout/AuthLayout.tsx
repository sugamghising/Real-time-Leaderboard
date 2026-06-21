import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-[448px]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-light text-on-surface">Leaderboard</h1>
          <p className="text-secondary mt-2">Real-time gaming platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
