import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gamepad2, Plus, Trash2, Edit, X, Loader2, Upload, ImageOff } from "lucide-react";
import { getGames, deleteGame, createGame, updateGame } from "../../api/endpoints/games";
import { useToast } from "../../lib/toast";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import type { Game } from "../../types";

const PLAYABLE_SLUGS = new Set(["click-speed", "reaction-time", "number-memory"]);

export const AdminGamesPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: gamesResponse, isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: () => getGames(),
  });

  const games = gamesResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: { title: string; slug: string; description?: string; image?: File }) =>
      createGame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      closeModal();
      addToast("Game created successfully", "success");
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || "Failed to create game");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ gameId, data }: { gameId: string; data: { title?: string; slug?: string; description?: string; image?: File } }) =>
      updateGame(gameId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      closeModal();
      addToast("Game updated successfully", "success");
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || "Failed to update game");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (gameId: string) => deleteGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      setDeletingId(null);
      addToast("Game deleted successfully", "success");
    },
    onError: (err: any) => {
      setDeletingId(null);
      addToast(err.response?.data?.error || "Failed to delete game", "error");
    },
  });

  const handleImageSelect = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingGame(null);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setError(null);
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-tertiary" />
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Manage Games</h1>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-none hover:bg-[#1A1A1A]"
        >
          <Plus className="w-4 h-4" />
          Add Game
        </button>
      </div>

      <div className="bg-surface rounded-md border border-border shadow-sm">
        <div className="p-4 md:p-6">
          {isLoading ? (
            <p className="text-secondary text-center py-8">Loading games...</p>
          ) : games.length === 0 ? (
            <p className="text-secondary text-center py-8">No games yet. Add your first game!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game: Game) => (
                <div
                  key={game.id}
                  className="border border-border rounded-md overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt={game.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-[#F5F5F5] flex items-center justify-center">
                      <ImageOff className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-on-surface">{game.title}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          PLAYABLE_SLUGS.has(game.slug)
                            ? "bg-green-100 text-green-700"
                            : "bg-[#F5F5F5] text-secondary"
                        }`}
                      >
                        {PLAYABLE_SLUGS.has(game.slug) ? "Playable" : "Manual"}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mb-1 font-mono">/{game.slug}</p>
                    <p className="text-sm text-secondary mb-3 line-clamp-2 flex-1">
                      {game.description || "No description"}
                    </p>
                    {game.createdBy && (
                      <p className="text-xs text-secondary mb-3">
                        By {game.createdBy.username} &middot;{" "}
                        {new Date(game.createdAt).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => openEditModal(game)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-none hover:bg-[#1A1A1A] text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(game.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-error text-white rounded-none hover:bg-[#C41E1A] text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Game Modal */}
      {showAddModal && (
        <GameFormModal
          title="Add New Game"
          submitLabel="Create Game"
          isPending={createMutation.isPending}
          error={error}
          imageFile={imageFile}
          imagePreview={imagePreview}
          onImageSelect={handleImageSelect}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={closeModal}
        />
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <GameFormModal
          title="Edit Game"
          submitLabel="Update Game"
          isPending={updateMutation.isPending}
          error={error}
          imageFile={imageFile}
          imagePreview={imagePreview}
          initialValues={{
            title: editingGame.title,
            slug: editingGame.slug,
            description: editingGame.description || "",
          }}
          onImageSelect={handleImageSelect}
          onSubmit={(data) =>
            updateMutation.mutate({ gameId: editingGame.id, data })
          }
          onCancel={closeModal}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingId}
        title="Delete Game"
        message="Are you sure you want to delete this game? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

interface GameFormModalProps {
  title: string;
  submitLabel: string;
  isPending: boolean;
  error: string | null;
  imageFile: File | null;
  imagePreview: string | null;
  initialValues?: { title: string; slug: string; description: string };
  onImageSelect: (file: File | null) => void;
  onSubmit: (data: { title: string; slug: string; description?: string; image?: File }) => void;
  onCancel: () => void;
}

const GameFormModal = ({
  title,
  submitLabel,
  isPending,
  error,
  imageFile,
  imagePreview,
  initialValues,
  onImageSelect,
  onSubmit,
  onCancel,
}: GameFormModalProps) => {
  const [formTitle, setFormTitle] = useState(initialValues?.title || "");
  const [formSlug, setFormSlug] = useState(initialValues?.slug || "");
  const [formDescription, setFormDescription] = useState(initialValues?.description || "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formTitle.trim() || formTitle.trim().length < 3) errs.title = "Title must be at least 3 characters";
    if (!formSlug.trim() || formSlug.trim().length < 3) errs.slug = "Slug must be at least 3 characters";
    else if (!/^[a-z0-9-]+$/.test(formSlug)) errs.slug = "Slug must be lowercase with hyphens only";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: formTitle.trim(),
      slug: formSlug.trim(),
      description: formDescription.trim() || undefined,
      ...(imageFile ? { image: imageFile } : {}),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-on-surface">{title}</h2>
          <button onClick={onCancel} disabled={isPending} className="text-secondary hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FEF2F2] border border-border rounded-none text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-none focus:outline-none focus:border-primary"
              placeholder="e.g., Click Speed Test"
            />
            {fieldErrors.title && <p className="mt-1 text-sm text-error">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Slug</label>
            <input
              type="text"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="w-full px-3 py-2 border border-border rounded-none focus:outline-none focus:border-primary"
              placeholder="e.g., click-speed"
            />
            {fieldErrors.slug && <p className="mt-1 text-sm text-error">{fieldErrors.slug}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-none focus:outline-none focus:border-primary"
              placeholder="Game description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Image</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-white text-on-surface border border-border rounded-none hover:bg-[#F5F5F5] cursor-pointer text-sm">
                <Upload className="w-4 h-4" />
                {imageFile ? "Change Image" : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageSelect(file);
                  }}
                />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => onImageSelect(null)}
                  className="text-sm text-error hover:text-error"
                >
                  Remove
                </button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md border border-border"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-white text-on-surface border border-border rounded-none hover:bg-[#F5F5F5] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-none hover:bg-[#1A1A1A] disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
