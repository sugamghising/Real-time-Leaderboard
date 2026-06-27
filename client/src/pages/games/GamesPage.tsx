/**
 * Games Page
 * List of all available games
 */

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Loader2, TrendingUp } from "lucide-react";
import { getGames } from "../../api/endpoints/games";
import type { Game } from "../../types";

export const GamesPage = () => {
  const navigate = useNavigate();

  const {
    data: games,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const response = await getGames();
      return response?.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary">Loading games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-[#FEF2F2] text-error px-6 py-4 rounded-md">
            <p className="font-medium">Failed to load games</p>
            <p className="text-sm mt-1">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-3">
          <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          Games
        </h1>
          <p className="text-secondary">
          {games?.length || 0} {games?.length === 1 ? "game" : "games"}{" "}
          available
        </p>
      </div>

      {!games || games.length === 0 ? (
        <div className="bg-surface rounded-md border border-border p-8 md:p-12 text-center">
          <Gamepad2 className="w-16 h-16 text-secondary mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-on-surface mb-2">
            No games available yet
          </h3>
        <p className="text-secondary">
            Check back later or contact an admin to add games.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game: Game) => (
            <div
              key={game.id}
              onClick={() => navigate(`/games/${game.id}`)}
              className="bg-surface rounded-md border border-border hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
            >
              {/* Game Image */}
              <div className="aspect-video bg-tertiary relative overflow-hidden">
                {game.imageUrl ? (
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gamepad2 className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="p-4 md:p-6">
                <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-accent transition-colors">
                  {game.title}
                </h3>

                {game.description && (
                  <p className="text-secondary text-sm mb-4 line-clamp-2">
                    {game.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Slug: {game.slug}</span>
                  <button className="flex items-center gap-1 text-accent hover:text-accent font-medium">
                    <TrendingUp className="w-4 h-4" />
                    View Leaderboard
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
