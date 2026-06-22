import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { updateProfile, uploadProfilePicture } from "../../api/endpoints/users";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "../../lib/toast";

export const UpdateProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.avatarUrl ?? ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  // revoke preview object URL on change/unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      // If a file is chosen, upload it first which also updates the user's avatarUrl on the server
      if (avatarFile) {
        const uploadResp = await uploadProfilePicture(avatarFile);
        return uploadResp.data; // server returns updated user
      }

      const resp = await updateProfile(user.id, {
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      return resp.data;
    },
    onSuccess: (updatedUser) => {
      // update auth store
      setUser(updatedUser ?? null);
      toast.addToast("Profile updated", "success");
      navigate("/profile");
    },
    onError: () => {
      toast.addToast("Failed to update profile", "error");
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Edit Profile</h1>

      <div className="bg-surface rounded-md border border-border shadow-sm p-4 md:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-on-surface">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full border border-border rounded-none px-3 py-2"
              placeholder="Display name"
            />
          </div>

          <div>
            <label className="block text-sm text-on-surface">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  setAvatarFile(f ?? null);
                  if (f) {
                    // revoke previous preview to avoid leaks
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                    }
                    const url = URL.createObjectURL(f);
                    setPreviewUrl(url);
                    // do NOT set avatarUrl input when selecting a file
                  }
                }}
                className="mt-1"
              />

              {/* Preview thumbnail: show selected file preview first, otherwise show current avatarUrl */}
              <div className="w-16 h-16 rounded overflow-hidden bg-[#F5F5F5]">
                {previewUrl ? (
                  // local preview
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="current avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary">
                    No image
                  </div>
                )}
              </div>

              {avatarFile && (
                <button
                  type="button"
                  onClick={() => {
                    // clear selected file and preview
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setAvatarFile(null);
                    setPreviewUrl(null);
                  }}
                  className="text-sm text-error px-2 py-1 rounded-none border border-border"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-sm text-secondary mt-2">
              Or provide a direct image URL below (optional)
            </p>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full border border-border rounded-none px-3 py-2"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="px-4 py-2 bg-primary text-white rounded-none hover:bg-[#1A1A1A] disabled:opacity-60"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="ml-3 px-4 py-2 bg-[#F5F5F5] rounded-none"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePage;
