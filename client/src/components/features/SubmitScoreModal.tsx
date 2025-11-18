import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Trophy, Loader2 } from "lucide-react";
import { submitScore } from "../../api/endpoints/scores";
import { queryClient } from "../../lib/queryClient";
import type { Game } from "../../types";

const submitScoreSchema = z.object({
  score: z.number().min(0, "Score must be positive"),
  meta: z.record(z.string(), z.any()).optional(),
});

type SubmitScoreFormData = z.infer<typeof submitScoreSchema>;

interface SubmitScoreModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitScoreModal = ({
  game,
  isOpen,
  onClose,
}: SubmitScoreModalProps) => {
  const queryClient = useQueryClient();
  const [metaFields, setMetaFields] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SubmitScoreFormData>({
    resolver: zodResolver(submitScoreSchema),
    defaultValues: {
      score: 0,
      meta: {},
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: SubmitScoreFormData) => submitScore(game.id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", "game", game.id],
      });
      queryClient.invalidateQueries({ queryKey: ["leaderboard", "global"] });
      onClose();
      // You could show a success toast here
      alert(`Score submitted! Your rank: ${response.data?.rank || "N/A"}`);
    },
    onError: (error: any) => {
      alert(
        `Failed to submit score: ${
          error.response?.data?.error || error.message
        }`
      );
    },
  });

  const onSubmit = (data: SubmitScoreFormData) => {
    const meta = Object.fromEntries(
      Object.entries(metaFields).filter(([_, value]) => value.trim() !== "")
    );

    submitMutation.mutate({
      ...data,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
    });
  };

  const addMetaField = () => {
    const key = `field_${Object.keys(metaFields).length + 1}`;
    setMetaFields((prev) => ({ ...prev, [key]: "" }));
  };

  const updateMetaField = (key: string, value: string) => {
    setMetaFields((prev) => ({ ...prev, [key]: value }));
  };

  const removeMetaField = (key: string) => {
    setMetaFields((prev) => {
      const newFields = { ...prev };
      delete newFields[key];
      return newFields;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Submit Score</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900">{game.title}</h3>
          <p className="text-sm text-blue-700">{game.description}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Score *
            </label>
            <input
              type="number"
              {...register("score", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your score"
              min="0"
            />
            {errors.score && (
              <p className="mt-1 text-sm text-red-600">
                {errors.score.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Data (Optional)
              </label>
              <button
                type="button"
                onClick={addMetaField}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Field
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(metaFields).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Field name"
                    value={key}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      setMetaFields((prev) => {
                        const newFields = { ...prev };
                        delete newFields[key];
                        newFields[newKey] = value;
                        return newFields;
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={value}
                    onChange={(e) => updateMetaField(key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeMetaField(key)}
                    className="px-2 py-2 text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add metadata like level, time, etc.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Submit Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
