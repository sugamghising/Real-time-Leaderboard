import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { getFriends } from "../../api/endpoints/friends";
import {
  getConversation,
  sendMessage as sendMessageAPI,
  markMessagesAsRead,
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

  const { data: conversationResponse, isLoading: conversationLoading } =
    useQuery({
      queryKey: ["conversation", selectedUserId],
      queryFn: () => (selectedUserId ? getConversation(selectedUserId) : null),
      enabled: !!selectedUserId,
    });

  const friends = friendsResponse?.data || [];
  const messages = conversationResponse?.data || [];

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    sendMessageMutation.mutate({
      toUserId: selectedUserId,
      content: messageText.trim(),
    });
  };

  const selectedFriend = friends.find(
    (friendship) =>
      friendship.requester.id === selectedUserId ||
      friendship.receiver.id === selectedUserId
  );
  const selectedUser = selectedFriend
    ? selectedFriend.requester.id === selectedUserId
      ? selectedFriend.requester
      : selectedFriend.receiver
    : null;

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
            friends.map((friendship) => {
              const friend = friendship.requester; // Assuming current user is receiver
              return (
                <button
                  key={friendship.id}
                  onClick={() => setSelectedUserId(friend.id)}
                  className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 text-left ${
                    selectedUserId === friend.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {friend.username || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {messages.length > 0
                          ? messages[messages.length - 1]?.content
                          : "No messages"}
                      </p>
                    </div>
                  </div>
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationLoading ? (
                <p className="text-gray-500 text-center">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.fromUserId === selectedUserId
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.fromUserId === selectedUserId
                          ? "bg-gray-200 text-gray-900"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sendMessageMutation.isPending}
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
