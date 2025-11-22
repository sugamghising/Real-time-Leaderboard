import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, User, UserPlus, UserCheck, UserX, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useFriendStore } from "../../stores/friendStore";
import {
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest,
} from "../../api/endpoints/friends";
import { useToast } from "../../lib/toast";
import { SUCCESS_MESSAGES } from "../../config/constants";

export const FriendsPage = () => {
  const queryClient = useQueryClient();
  const { pendingCount } = useFriendStore();

  const { data: friendsResponse, isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: () => getFriends(),
  });

  const { data: requestsResponse, isLoading: requestsLoading } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: getPendingRequests,
  });

  const friendsData = friendsResponse?.data || [];
  const receivedRequests = requestsResponse?.data?.received || [];
  const sentRequests = requestsResponse?.data?.sent || [];

  // Keep friend store in sync with fetched requests so UI shows accurate pending count
  const { setFriendRequests } = useFriendStore();

  // Whenever requestsResponse updates, sync into store
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (requestsResponse?.data) {
      setFriendRequests(requestsResponse.data.received || []);
    }
  }, [requestsResponse?.data, setFriendRequests]);

  // Search users (send friend requests)
  const [query, setQuery] = useState("");
  const { data: searchResponse, isLoading: searchLoading } = useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => searchUsers(query),
    enabled: query.trim().length > 0,
  });
  const searchResults = searchResponse?.data || [];

  const toast = useToast();

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      toast.addToast(SUCCESS_MESSAGES.FRIEND_REQUEST_ACCEPTED, "success");
    },
    onError: () => {
      toast.addToast("Failed to accept friend request", "error");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      toast.addToast("Friend request rejected", "info");
    },
    onError: () => {
      toast.addToast("Failed to reject friend request", "error");
    },
  });

  const handleAccept = (requestId: string) => {
    acceptMutation.mutate(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectMutation.mutate(requestId);
  };

  const sendMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      // clear search query so UI updates
      setQuery("");
      toast.addToast(SUCCESS_MESSAGES.FRIEND_REQUEST_SENT, "success");
    },
    onError: () => {
      toast.addToast("Failed to send friend request", "error");
    },
  });

  const handleSendRequest = (userId: string) => {
    sendMutation.mutate(userId);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <Users className="w-8 h-8 text-blue-600" />
        Friends
      </h1>

      {/* Friend Requests */}
      {(receivedRequests.length > 0 || pendingCount > 0) && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Friend Requests
              <span className="bg-blue-100 text-blue-700 text-sm px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            </h2>
          </div>
          <div className="p-6">
            {requestsLoading ? (
              <p className="text-gray-500 text-center">Loading...</p>
            ) : receivedRequests.length === 0 ? (
              <p className="text-gray-500 text-center">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {receivedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                        {request.requester?.avatarUrl ||
                        (request.requester as any)?.profilePicture ? (
                          <img
                            src={
                              request.requester?.avatarUrl ||
                              (request.requester as any).profilePicture
                            }
                            alt={`${request.requester?.username} avatar`}
                            className="w-10 h-10 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {(
                              request.requester?.username?.charAt(0) || ""
                            ).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.requester?.username}
                        </p>
                        <p className="text-sm text-gray-500">Friend request</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        disabled={
                          acceptMutation.isPending || rejectMutation.isPending
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={
                          acceptMutation.isPending || rejectMutation.isPending
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Friends</h2>
        </div>
        <div className="p-6">
          {friendsLoading ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : !friendsData || friendsData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No friends yet. Start adding some!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendsData.map((friendship) => {
                // server may return friendship with a `friend` object (our service maps it),
                // or with `requester`/`receiver` fields depending on the endpoint.
                const friend =
                  (friendship as any).friend ||
                  (friendship as any).requester ||
                  (friendship as any).receiver;
                return (
                  <div
                    key={friendship.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                        {friend?.avatarUrl ||
                        (friend as any)?.profilePicture ? (
                          <img
                            src={
                              friend?.avatarUrl ||
                              (friend as any).profilePicture
                            }
                            alt={`${friend?.username} avatar`}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {(
                              friend?.username?.charAt(0) || ""
                            ).toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {friend?.username || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">Friend</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Find Players / Send Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Players
          </h2>
          <div className="w-1/3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or email"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="p-6">
          {searchLoading ? (
            <p className="text-gray-500">Searching...</p>
          ) : searchResults.length === 0 && query.trim() !== "" ? (
            <p className="text-gray-500">No users found</p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {u.profilePicture || (u as any).avatarUrl ? (
                        <img
                          src={u.profilePicture || (u as any).avatarUrl}
                          alt={`${u.username} avatar`}
                          className="w-10 h-10 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {(u.username?.charAt(0) || "").toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.username}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div>
                    {u.friendshipStatus === "ACCEPTED" ? (
                      <span className="text-sm text-gray-500">Friends</span>
                    ) : u.friendshipStatus === "PENDING" ? (
                      <span className="text-sm text-gray-500">
                        Request Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(u.id)}
                        disabled={sendMutation.isPending}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
