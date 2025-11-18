import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, UserCheck, UserX } from "lucide-react";
import { useFriendStore } from "../../stores/friendStore";
import {
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../api/endpoints/friends";

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

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const handleAccept = (requestId: string) => {
    acceptMutation.mutate(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectMutation.mutate(requestId);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <Users className="w-8 h-8 text-blue-600" />
        Friends
      </h1>

      {/* Friend Requests */}
      {pendingCount > 0 && (
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
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.requester?.username?.charAt(0).toUpperCase()}
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
                const friend = friendship.requester;
                return (
                  <div
                    key={friendship.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {friend?.username?.charAt(0).toUpperCase() || "?"}
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
    </div>
  );
};
