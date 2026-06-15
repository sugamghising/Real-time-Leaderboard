import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { createSession } from "../../api/endpoints/sessions";
import { Loader2, RefreshCw } from "lucide-react";

interface ClickSpeedProps {
  gameId: string;
  onComplete?: (result: { score: number; rank?: number }) => void;
}

type Phase = "idle" | "playing" | "ended";

export const ClickSpeed = ({ gameId, onComplete }: ClickSpeedProps) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [startTime, setStartTime] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickAreaRef = useRef<HTMLButtonElement>(null);

  const sessionMutation = useMutation({
    mutationFn: (data: { score: number; duration: number; meta: Record<string, unknown> }) =>
      createSession({ gameId, ...data }),
    onSuccess: (response) => {
      onComplete?.({ score: response.data.score });
    },
  });

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startGame = () => {
    setClicks(0);
    setTimeLeft(10);
    setStartTime(Date.now());
    setPhase("playing");
    clickAreaRef.current?.focus();
  };

  useEffect(() => {
    if (phase !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          cleanup();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return cleanup;
  }, [phase, cleanup]);

  useEffect(() => {
    if (timeLeft === 0 && phase === "playing") {
      setPhase("ended");
      const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 10;
      sessionMutation.mutate({
        score: clicks,
        duration,
        meta: { cps: (clicks / duration).toFixed(1) },
      });
    }
  }, [timeLeft, phase]);

  const handleClick = () => {
    if (phase === "playing") {
      setClicks((c) => c + 1);
    }
  };

  const cps = timeLeft > 0 && startTime
    ? (clicks / ((Date.now() - startTime) / 1000)).toFixed(1)
    : clicks > 0
      ? (clicks / 10).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {phase === "idle" && (
        <div className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900">Click Speed Test</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Click as fast as you can in <strong>10 seconds</strong>.
            Test your CPS (clicks per second) and compete on the leaderboard!
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <div>
              <span className="block text-2xl font-bold text-blue-600">10s</span>
              Duration
            </div>
            <div>
              <span className="block text-2xl font-bold text-green-600">CPS</span>
              Score
            </div>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div className="text-center space-y-4 py-4">
          <div className="flex justify-center items-center gap-8 mb-4">
            <div>
              <span className="block text-3xl font-bold text-gray-900">{timeLeft}s</span>
              <span className="text-sm text-gray-500">Time Left</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-blue-600">{clicks}</span>
              <span className="text-sm text-gray-500">Clicks</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-green-600">{cps}</span>
              <span className="text-sm text-gray-500">CPS</span>
            </div>
          </div>
          <button
            ref={clickAreaRef}
            onClick={handleClick}
            className="w-full h-48 bg-blue-50 border-2 border-blue-200 rounded-xl text-2xl font-bold text-blue-700 hover:bg-blue-100 active:bg-blue-200 active:scale-95 transition-all select-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            CLICK HERE
          </button>
          <p className="text-sm text-gray-400">Click the area above as fast as you can!</p>
        </div>
      )}

      {phase === "ended" && (
        <div className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900">Time's Up!</h2>
          <div className="flex justify-center gap-8">
            <div>
              <span className="block text-4xl font-bold text-blue-600">{clicks}</span>
              <span className="text-sm text-gray-500">Total Clicks</span>
            </div>
            <div>
              <span className="block text-4xl font-bold text-green-600">{cps}</span>
              <span className="text-sm text-gray-500">CPS</span>
            </div>
          </div>

          {sessionMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting score...
            </div>
          )}

          {sessionMutation.isSuccess && (
            <div className="p-4 bg-green-50 rounded-lg text-green-700 font-medium">
              Score submitted! Your rank is updating...
            </div>
          )}

          {sessionMutation.isError && (
            <div className="p-4 bg-red-50 rounded-lg text-red-600">
              Failed to submit score. Please try again.
            </div>
          )}

          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
