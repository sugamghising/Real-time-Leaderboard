/**
 * Main Layout Component
 * Wraps all pages with navigation and footer
 */

import type { BaseComponentProps } from "../../types";

export const MainLayout = ({ children }: BaseComponentProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header/Navigation - to be implemented */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Real-Time Leaderboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer - to be implemented */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-600">
          <p>&copy; 2025 Real-Time Leaderboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
