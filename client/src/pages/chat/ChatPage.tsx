import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { getFriends } from "../../api/endpoints/friends";
import {
  getConversation,
  sendMessage as sendMessageAPI,
  markMessagesAsRead,
  getMessagePreviews,
} from "../../api/endpoints/messages";
import type { SendMessageData } from "../../types";

export const ChatPage = () => {
  const { userId } = useParams<{ userId?: string }>();
  const queryClient = useQueryClient();
  const { totalUnreadCount } = useChatStore();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    userId
  );
  const [messageText, setMessageText] = useState("");

  const { data: friendsResponse } = useQuery({
    queryKey: ["friends"],
    queryFn: () => getFriends(),
  });

  const { data: previewsResponse } = useQuery({
    queryKey: ["messages", "previews"],
    queryFn: () => getMessagePreviews(),
  });

  const previews = (previewsResponse?.data || []) as {
    userId: string;
    message: any;
  }[];
  const previewsMap = previews.reduce((acc, p) => {
    acc[p.userId] = p.message;
    return acc;
  }, {} as Record<string, any>);

  const authUser = useAuthStore((s) => s.user);
  const authUserId = authUser?.id;

  // helper: create initials from username
  const initials = (name?: string) =>
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const { data: conversationResponse, isLoading: conversationLoading } =
    useQuery({
      queryKey: ["conversation", selectedUserId],
      queryFn: () => (selectedUserId ? getConversation(selectedUserId) : null),
      enabled: !!selectedUserId,
    });

  const friends = friendsResponse?.data || [];
  const messages = conversationResponse?.data || [];
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageData) => sendMessageAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", selectedUserId],
      });
      setMessageText("");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (data: { conversationUserId: string }) =>
      markMessagesAsRead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", selectedUserId],
      });
    },
  });

  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      // Mark messages as read when conversation is opened
      markReadMutation.mutate({ conversationUserId: selectedUserId });
    }
  }, [selectedUserId, messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    // scroll to bottom smoothly
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, selectedUserId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    sendMessageMutation.mutate({
      toUserId: selectedUserId,
      content: messageText.trim(),
    });
  };

  // Helper to get the user object for display from a friendship record.
  const getFriendUser = (friendship: any) =>
    friendship.friend || friendship.requester || friendship.receiver || null;

  const selectedFriend = friends.find((friendship: any) => {
    const friendUser = getFriendUser(friendship);
    return friendUser?.id === selectedUserId;
  });

  const selectedUser = selectedFriend ? getFriendUser(selectedFriend) : null;

  return (
    <div className="h-[calc(100vh-12rem)] bg-white rounded-lg shadow flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messages
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">
              No friends yet. Add some friends to start chatting!
            </p>
          ) : (
            friends.map((friendship: any) => {
              const friend = getFriendUser(friendship);
              if (!friend) return null;
              const last = previewsMap[friend.id];
              const snippet = last?.content || "No messages";
              const lastTime = last?.createdAt
                ? new Date(last.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;
              const unread =
                last && last.toUserId === authUserId && !last.isRead;

              return (
                <button
                  key={friendship.id}
                  onClick={() => setSelectedUserId(friend.id)}
                  className={`w-full p-3 border-b border-gray-200 hover:bg-gray-50 text-left flex items-center gap-3 ${
                    selectedUserId === friend.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt="avatar"
                        className="w-10 h-10 object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">
                        {initials(friend.username)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {friend.username || "Unknown User"}
                      </p>
                      {lastTime && (
                        <p className="text-xs text-gray-400">{lastTime}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{snippet}</p>
                  </div>

                  {unread && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedUserId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p>Select a friend to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Chat with {selectedUser?.username || "User"}
              </h3>
            </div>

            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {conversationLoading ? (
                <p className="text-gray-500 text-center">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet</p>
              ) : (
                messages.map((message, idx) => {
                  const isOwn = message.fromUserId === authUserId;
                  // show avatar when the next message is from a different sender or it's the last message
                  const next = messages[idx + 1];
                  const showAvatar =
                    !next || next.fromUserId !== message.fromUserId;
                  const timeLabel = new Date(
                    message.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar for other user */}
                      {!isOwn && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700 overflow-hidden">
                          {selectedUser?.avatarUrl ? (
                            <img
                              src={selectedUser.avatarUrl}
                              alt="avatar"
                              className="w-8 h-8 object-cover"
                            />
                          ) : (
                            <span>{initials(selectedUser?.username)}</span>
                          )}
                        </div>
                      )}

                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70 text-right">
                          {timeLabel}
                        </p>
                      </div>

                      {/* Avatar placeholder for own messages if desired */}
                      {isOwn && showAvatar && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700 overflow-hidden">
                          {authUser?.avatarUrl ? (
                            <img
                              src={authUser.avatarUrl}
                              alt="you"
                              className="w-6 h-6 object-cover"
                            />
                          ) : (
                            <span>{initials(authUser?.username)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200"
            >
              <div className="flex gap-2 items-end">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-12 max-h-40"
                  disabled={sendMessageMutation.isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={
                    sendMessageMutation.isPending || !messageText.trim()
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
