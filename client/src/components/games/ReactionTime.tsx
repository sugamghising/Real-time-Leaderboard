import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { createSession } from "../../api/endpoints/sessions";
import { Loader2, RefreshCw, Zap } from "lucide-react";

interface ReactionTimeProps {
  gameId: string;
  onComplete?: (result: { score: number }) => void;
}

type Phase = "idle" | "waiting" | "go" | "result" | "ended";

const TOTAL_TRIALS = 5;

export const ReactionTime = ({ gameId, onComplete }: ReactionTimeProps) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [trials, setTrials] = useState<number[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [falseStarts, setFalseStarts] = useState(0);
  const [lastTime, setLastTime] = useState<number | null>(null);

  const goTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  const sessionMutation = useMutation({
    mutationFn: (data: { score: number; duration: number; meta: Record<string, unknown> }) =>
      createSession({ gameId, ...data }),
    onSuccess: (response) => {
      onComplete?.({ score: response.data.score });
    },
  });

  const cleanup = useCallback(() => {
    if (goTimeoutRef.current) {
      clearTimeout(goTimeoutRef.current);
      goTimeoutRef.current = null;
    }
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
      reactionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startWaiting = () => {
    cleanup();
    setPhase("waiting");
    const delay = 1000 + Math.random() * 4000;
    goTimeoutRef.current = setTimeout(() => {
      setPhase("go");
      startTimeRef.current = Date.now();
    }, delay);
  };

  const startGame = () => {
    setTrials([]);
    setCurrentTrial(0);
    setFalseStarts(0);
    setLastTime(null);
    startWaiting();
  };

  const handleClick = () => {
    if (phase === "waiting") {
      cleanup();
      setFalseStarts((c) => c + 1);
      reactionTimeoutRef.current = setTimeout(() => startWaiting(), 1000);
      return;
    }

    if (phase === "go") {
      const reactionMs = Date.now() - startTimeRef.current;
      const newTrials = [...trials, reactionMs];
      const nextTrial = currentTrial + 1;

      setTrials(newTrials);
      setCurrentTrial(nextTrial);
      setLastTime(reactionMs);

      if (nextTrial >= TOTAL_TRIALS) {
        setPhase("ended");
        cleanup();
        const avgMs = Math.round(newTrials.reduce((a, b) => a + b, 0) / newTrials.length);
        const score = computeScore(avgMs);
        sessionMutation.mutate({
          score,
          duration: avgMs,
          meta: { trials: newTrials, averageMs: avgMs, falseStarts },
        });
      } else {
        setPhase("result");
        reactionTimeoutRef.current = setTimeout(() => startWaiting(), 1500);
      }
    }
  };

  const best = trials.length > 0 ? Math.min(...trials) : 0;
  const avg = trials.length > 0 ? Math.round(trials.reduce((a, b) => a + b, 0) / trials.length) : 0;
  const leaderboardScore = computeScore(avg);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {phase === "idle" && (
        <div className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900">Reaction Time Test</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Click as soon as the screen turns <strong className="text-green-600">green</strong>.
            Complete <strong>{TOTAL_TRIALS} trials</strong> to get your average reaction time.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <div>
              <span className="block text-2xl font-bold text-blue-600">{TOTAL_TRIALS}</span>
              Trials
            </div>
            <div>
              <span className="block text-2xl font-bold text-green-600">ms</span>
              Score (lower = better)
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

      {(phase === "waiting" || phase === "go" || phase === "result") && (
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center gap-6 mb-4 text-sm text-gray-500">
            <span>Trial {currentTrial + 1} / {TOTAL_TRIALS}</span>
            <span>False starts: {falseStarts}</span>
          </div>

          {phase === "waiting" && (
            <div
              onClick={handleClick}
              className="w-full h-48 bg-red-50 border-2 border-red-200 rounded-xl flex items-center justify-center cursor-pointer select-none"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 mb-2">Wait for green...</p>
                <p className="text-sm text-red-400">Don't click yet!</p>
              </div>
            </div>
          )}

          {phase === "go" && (
            <div
              onClick={handleClick}
              className="w-full h-48 bg-green-50 border-2 border-green-200 rounded-xl flex items-center justify-center cursor-pointer select-none hover:bg-green-100 transition-colors"
            >
              <div className="text-center">
                <Zap className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-green-600">CLICK NOW!</p>
              </div>
            </div>
          )}

          {phase === "result" && (
            <div
              onClick={handleClick}
              className="w-full h-48 bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center select-none"
            >
              <div className="text-center">
                {lastTime !== null && (
                  <>
                    <p className="text-4xl font-bold text-blue-600 mb-1">{lastTime}</p>
                    <p className="text-sm text-gray-500">ms</p>
                  </>
                )}
                <p className="text-sm text-gray-400 mt-2">Next round starting...</p>
              </div>
            </div>
          )}

          {trials.length > 0 && (
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <span>Best: <strong className="text-green-600">{Math.min(...trials)}ms</strong></span>
              <span>Average: <strong className="text-blue-600">{avg}ms</strong></span>
            </div>
          )}
        </div>
      )}

      {phase === "ended" && (
        <div className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900">Results</h2>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-blue-50 rounded-lg p-4">
              <span className="block text-3xl font-bold text-blue-600">{avg}</span>
              <span className="text-sm text-gray-500">Avg (ms)</span>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <span className="block text-3xl font-bold text-green-600">{best}</span>
              <span className="text-sm text-gray-500">Best (ms)</span>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <span className="block text-3xl font-bold text-purple-600">{leaderboardScore}</span>
              <span className="text-sm text-gray-500">Score</span>
            </div>
          </div>

          {falseStarts > 0 && (
            <p className="text-sm text-orange-600">{falseStarts} false start{falseStarts > 1 ? "s" : ""}</p>
          )}

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

function computeScore(avgMs: number): number {
  return Math.max(0, Math.round((3000 - Math.min(avgMs, 3000)) / 10));
}
