import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { updateProfile, uploadProfilePicture } from "../../api/endpoints/users";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "../../lib/toast";

export const UpdateProfilePage = () => {
  const { user, setUser, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.avatarUrl ?? ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

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
      <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Display name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                setAvatarFile(f ?? null);
                if (f) {
                  // revoke existing object URL to avoid leaks
                  if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                  }
                  const url = URL.createObjectURL(f);
                  setObjectUrl(url);
                  setAvatarUrl(url);
                }
              }}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-2">
              Or provide a direct image URL below (optional)
            </p>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="ml-3 px-4 py-2 bg-gray-100 rounded"
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
