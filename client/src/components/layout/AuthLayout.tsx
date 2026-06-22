import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-[448px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-none flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-headline font-light tracking-tight">R</span>
          </div>
          <h1 className="text-3xl font-headline font-light text-on-surface">Leaderboard</h1>
          <p className="text-secondary text-sm mt-1.5">Real-time gaming platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
