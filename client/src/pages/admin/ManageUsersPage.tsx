import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  adminUpdateUser,
  adminDeleteUser,
} from "../../api/endpoints/users";
import { useAuthStore } from "../../stores/authStore";
import type { User, UserRole } from "../../types";

export const ManageUsersPage = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("USER");

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => getAllUsers(),
  });

  const users = usersResponse?.data || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      adminUpdateUser(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteUser(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setRole(u.role || "USER");
  };

  const saveEdit = (id: string) => {
    updateMutation.mutate({ id, payload: { role } });
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-sm text-gray-500 text-center"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-sm text-gray-500 text-center"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u: User) => (
                  <tr
                    key={u.id}
                    className={u.id === authUser?.id ? "bg-gray-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt="avatar"
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-sm text-gray-700">
                              {(u.username || "").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {u.username}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {u.displayName || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === u.id ? (
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as UserRole)}
                          className="border rounded px-2 py-1"
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
                            className="px-3 py-1 bg-green-600 text-white rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-200 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {u.id !== authUser?.id && (
                            <button
                              onClick={() => startEdit(u)}
                              className="px-3 py-1 bg-blue-600 text-white rounded"
                            >
                              Edit
                            </button>
                          )}
                          {u.id !== authUser?.id && (
                            <button
                              onClick={() => confirmDelete(u.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded"
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
    </div>
  );
};

export default ManageUsersPage;
