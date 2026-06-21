import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, adminUpdateUser, adminDeleteUser } from "../../api/endpoints/users";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "../../lib/toast";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import type { User, UserRole } from "../../types";

export const ManageUsersPage = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();
  const { addToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("USER");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => getAllUsers(),
  });

  const users = usersResponse?.data || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      adminUpdateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setEditingId(null);
      addToast("User role updated", "success");
    },
    onError: (err: any) => {
      addToast(err.response?.data?.error || "Failed to update user", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setDeletingId(null);
      addToast("User deleted successfully", "success");
    },
    onError: (err: any) => {
      setDeletingId(null);
      addToast(err.response?.data?.error || "Failed to delete user", "error");
    },
  });

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setRole(u.role || "USER");
  };

  const saveEdit = (id: string) => {
    updateMutation.mutate({ id, payload: { role } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-on-surface">Manage Users</h1>
      </div>

      <div className="bg-surface rounded-md border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-[#FAFAFA]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-sm text-secondary text-center">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-sm text-secondary text-center">No users found</td>
                </tr>
              ) : (
                users.map((u: User) => (
                  <tr key={u.id} className={u.id === authUser?.id ? "bg-[#FAFAFA]" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E5E7EB] overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="avatar" className="w-10 h-10 object-cover" />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-sm text-on-surface">
                              {(u.username || "").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-medium text-on-surface truncate">{u.username}</div>
                          <div className="text-xs text-secondary truncate">{u.displayName || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {editingId === u.id ? (
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as UserRole)}
                          className="border border-border rounded-none px-2 py-1"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span className="font-medium">{u.role || "USER"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                      {editingId === u.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(u.id)}
                            disabled={updateMutation.isPending}
                            className="px-3 py-1 bg-success text-white rounded-none disabled:opacity-50"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-[#E5E7EB] rounded-none"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {u.id !== authUser?.id && (
                            <button
                              onClick={() => startEdit(u)}
                              className="px-3 py-1 bg-primary text-white rounded-none"
                            >
                              Edit
                            </button>
                          )}
                          {u.id !== authUser?.id && (
                            <button
                              onClick={() => setDeletingId(u.id)}
                              className="px-3 py-1 bg-error text-white rounded-none"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deletingId}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default ManageUsersPage;
