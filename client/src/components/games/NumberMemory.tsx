import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { createSession } from "../../api/endpoints/sessions";
import { Loader2, RefreshCw, Eye, Brain } from "lucide-react";

interface NumberMemoryProps {
  gameId: string;
  onComplete?: (result: { score: number }) => void;
}

type Phase = "idle" | "memorize" | "recall" | "ended";

const STARTING_DIGITS = 4;

function generateNumber(length: number): string {
  let num = "";
  for (let i = 0; i < length; i++) {
    num += Math.floor(Math.random() * 10).toString();
  }
  return num;
}

export const NumberMemory = ({ gameId, onComplete }: NumberMemoryProps) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [digits, setDigits] = useState(STARTING_DIGITS);
  const [target, setTarget] = useState("");
  const [userInput, setUserInput] = useState("");
  const [highScore, setHighScore] = useState(0);
  const [roundsWon, setRoundsWon] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sessionMutation = useMutation({
    mutationFn: (data: { score: number; duration: number; meta: Record<string, unknown> }) =>
      createSession({ gameId, ...data }),
    onSuccess: (response) => {
      onComplete?.({ score: response.data.score });
    },
  });

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startRound = useCallback(() => {
    const num = generateNumber(digits);
    setTarget(num);
    setUserInput("");
    setPhase("memorize");
    setStartTime(Date.now());

    const showMs = Math.max(1000, digits * 1000);
    timerRef.current = setTimeout(() => {
      setPhase("recall");
    }, showMs);
  }, [digits]);

  const startGame = () => {
    setDigits(STARTING_DIGITS);
    setHighScore(0);
    setRoundsWon(0);
    startRound();
  };

  const handleSubmit = () => {
    if (phase !== "recall") return;

    const isCorrect = userInput === target;
    if (isCorrect) {
      const newRoundsWon = roundsWon + 1;
      const newScore = digits;

      setRoundsWon(newRoundsWon);
      setHighScore(newScore);
      setDigits((d) => d + 1);

      timerRef.current = setTimeout(() => startRound(), 1000);
    } else {
      setPhase("ended");
      const duration = Math.round((Date.now() - startTime) / 1000);
      const totalDuration = startTime
        ? Math.round((Date.now() - startTime + (roundsWon * 2)) / 1000)
        : 1;

      sessionMutation.mutate({
        score: highScore || STARTING_DIGITS,
        duration: totalDuration,
        meta: {
          digitsReached: highScore || STARTING_DIGITS,
          roundsWon,
          correctNumber: target,
          userAnswer: userInput,
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const maskedTarget = phase === "memorize"
    ? target.split("").map((d, i) => <span key={i} className="inline-block w-8">{d}</span>)
    : null;

  const showMs = Math.max(1000, digits * 1000);

  return (
    <div className="bg-surface rounded-md border border-border shadow-sm p-6">
      {phase === "idle" && (
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <Brain className="w-16 h-16 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Number Memory Test</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            A number will flash on screen. Memorize it, then type it back.
            Each correct round adds <strong>one more digit</strong>. How far can you go?
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <div>
              <span className="block text-2xl font-bold text-tertiary">{STARTING_DIGITS}</span>
              Starting Digits
            </div>
            <div>
              <span className="block text-2xl font-bold text-success">Digits</span>
              Score
            </div>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-tertiary text-white text-lg font-semibold rounded-none hover:bg-[#36006B] transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      {phase === "memorize" && (
        <div className="text-center space-y-6 py-12">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
            <Eye className="w-4 h-4" />
            Memorize this number
          </div>
          <div className="text-5xl font-mono font-bold tracking-widest text-tertiary select-none">
            {maskedTarget}
          </div>
          <div className="w-full bg-border rounded-full h-2 max-w-xs mx-auto">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-200"
              style={{ width: "100%" }}
            />
          </div>
          <p className="text-sm text-gray-400">
            Disappears in {Math.ceil(showMs / 1000)}s...
          </p>
        </div>
      )}

      {phase === "recall" && (
        <div className="text-center space-y-6 py-8">
          <p className="text-lg font-medium text-gray-700">Type the number you saw</p>
          <div className="max-w-xs mx-auto">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full text-center text-3xl font-mono tracking-widest px-4 py-3 border-2 border-tertiary/30 rounded-none focus:outline-none focus:border-tertiary"
              placeholder={"_".repeat(digits)}
            />
          </div>
          <p className="text-sm text-gray-400">({digits} digits)</p>
          <button
            onClick={handleSubmit}
            disabled={userInput.length === 0}
            className="px-8 py-3 bg-tertiary text-white font-semibold rounded-none hover:bg-[#36006B] disabled:opacity-50 transition-colors"
          >
            Submit
          </button>
        </div>
      )}

      {phase === "ended" && (
        <div className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900">Game Over</h2>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="bg-[#F5F0FF] rounded-none p-4">
              <span className="block text-4xl font-bold text-tertiary">{highScore || STARTING_DIGITS}</span>
              <span className="text-sm text-gray-500">Best Digits</span>
            </div>
            <div className="bg-[#F0FDF4] rounded-none p-4">
              <span className="block text-4xl font-bold text-success">{roundsWon}</span>
              <span className="text-sm text-gray-500">Rounds Won</span>
            </div>
          </div>

          <div className="p-4 bg-[#F5F5F5] rounded-none max-w-sm mx-auto">
            <p className="text-sm text-gray-500 mb-1">You missed:</p>
            <p className="text-lg font-mono font-bold text-error tracking-widest">{target}</p>
            <p className="text-sm text-gray-400 mt-1">Your answer: {userInput}</p>
          </div>

          {sessionMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting score...
            </div>
          )}

          {sessionMutation.isSuccess && (
            <div className="p-4 bg-[#F0FDF4] rounded-none text-green-700 font-medium">
              Score submitted! Your rank is updating...
            </div>
          )}

          {sessionMutation.isError && (
            <div className="p-4 bg-[#FEF2F2] rounded-none text-error">
              Failed to submit score. Please try again.
            </div>
          )}

          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-6 py-3 bg-tertiary text-white font-semibold rounded-none hover:bg-[#36006B] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      )}

      {phase !== "idle" && phase !== "ended" && highScore > 0 && (
        <div className="text-center text-sm text-gray-400 mt-2">
          Best so far: <strong className="text-tertiary">{highScore}</strong> digits
        </div>
      )}
    </div>
  );
};
