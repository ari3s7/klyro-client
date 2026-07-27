import { useEffect, useState, useRef } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { deleteMessage } from "@/features/message/api/delete-message";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getCurrentUser } from "@/features/auth/api/get-current-user"

import { socket } from "@/lib/socket";

import {
  getMessages,
  sendMessage,
  editMessage,
} from "@/features/message/api/message-api";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Message } from "@/features/message/types";

interface ChatAreaProps {
  selectedChannelId: string | null;
}

export default function ChatArea({
  selectedChannelId,
}: ChatAreaProps) {
  const [content, setContent] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", selectedChannelId],
    queryFn: () => getMessages(selectedChannelId!),
    enabled: !!selectedChannelId,
  });
  const { data: user } = useQuery({
  queryKey: ["current-user"],
  queryFn: getCurrentUser,
});

  // Join / Leave channel
  useEffect(() => {
  if (!selectedChannelId) return;

  socket.emit("join-channel", selectedChannelId);

  return () => {
    socket.emit("leave-channel", selectedChannelId);
  };
}, [selectedChannelId]);

useEffect(() => {
  if (!selectedChannelId) return;

  const handleNewMessage = (message: Message) => {
    queryClient.setQueryData<Message[]>(
      ["messages", selectedChannelId],
      (old = []) => [...old, message]
    );
  };

  const handleTypingStart = ({ username }: { username: string }) => {
    setTypingUser(username);
  };

  const handleTypingStop = () => {
    setTypingUser(null);
  };

  socket.on("message-created", handleNewMessage);
  socket.on("typing-start", handleTypingStart);
  socket.on("typing-stop", handleTypingStop);

  return () => {
    socket.off("message-created", handleNewMessage);
    socket.off("typing-start", handleTypingStart);
    socket.off("typing-stop", handleTypingStop);
  };
}, [selectedChannelId, queryClient]);

useEffect(() => {
  bottomRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);

  const mutation = useMutation({
    mutationFn: (content: string) =>
      sendMessage(selectedChannelId!, {
        content,
      }),

    onSuccess: () => {
      setContent("");
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
  mutationFn: deleteMessage,

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["messages", selectedChannelId],
    });
  },

  onError: (error) => {
    console.error(error);
  },
});

  const editMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      editMessage(id, { content }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedChannelId],
      });
      setEditingId(null);
      setEditContent("");
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleSend = () => {
    if (!selectedChannelId) return;
    if (!content.trim()) return;

    mutation.mutate(content);
  };

  const startEdit = (message: Message) => {
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = (messageId: string) => {
    if (!editContent.trim()) return;
    editMutation.mutate({ id: messageId, content: editContent });
  };

  const handleDelete = (messageId: string) => {
    if (confirm("Delete this message?")) {
      deleteMutation.mutate(messageId);
    }
  };

  if (!selectedChannelId) {
    return (
      <section className="flex flex-1 items-center justify-center bg-zinc-950 text-zinc-500">
        Select a channel to start chatting.
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col bg-zinc-950">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-zinc-800 px-6">
        <h2 className="font-semibold">Channel Chat</h2>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {isLoading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-zinc-500">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="group relative flex gap-3 rounded-lg bg-zinc-900 p-3"
            >
              <img
    src={
      message.sender.avatar ||
      `https://api.dicebear.com/9.x/thumbs/svg?seed=${message.sender.username}`
    }
    alt={message.sender.username}
    className="h-9 w-9 shrink-0 rounded-full bg-zinc-800"
  />
              <div className="flex-1">
    <div className="flex items-center justify-between">
      <p className="font-semibold">
        {message.sender.username}
      </p>

  <div className="flex items-center gap-2">
    <span className="text-xs text-zinc-500">
      {new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>

    {message.sender.id === user?.id && editingId !== message.id && (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button className="rounded p-1 text-zinc-400 opacity-100 transition hover:bg-zinc-700 hover:text-white md:opacity-0 md:group-hover:opacity-100">
            <MoreVertical size={15} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => startEdit(message)}
          >
            <Pencil size={14} className="mr-2" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer text-red-500"
            onClick={() => handleDelete(message.id)}
          >
            <Trash2 size={14} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  </div>
</div>

{editingId === message.id ? (
  <div className="mt-2 flex flex-col gap-2">
    <textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      autoFocus
      rows={2}
      className="w-full resize-none rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          saveEdit(message.id);
        }

        if (e.key === "Escape") {
          cancelEdit();
        }
      }}
    />

    <div className="flex gap-2">
      <button
        onClick={() => saveEdit(message.id)}
        disabled={editMutation.isPending}
        className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {editMutation.isPending ? "Saving..." : "Save"}
      </button>

      <button
        onClick={cancelEdit}
        className="rounded-md bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-600"
      >
        Cancel
      </button>
    </div>
  </div>
) : (
  <p className="mt-2 text-zinc-300">
    {message.content}
  </p>
)}
</div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4">
        {typingUser && (
  <p className="mb-2 text-sm italic text-zinc-400">
    {typingUser} is typing...
  </p>
)}
        <div className="flex gap-3">
          <input
            value={content}
            onChange={(e) => {
  setContent(e.target.value);

  if (!isTypingRef.current) {
    socket.emit("typing-start", {
      channelId: selectedChannelId,
      username: user?.username,
    });

    isTypingRef.current = true;
  }

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  typingTimeoutRef.current = setTimeout(() => {
    socket.emit("typing-stop", {
      channelId: selectedChannelId,
      username: user?.username,
    });

    isTypingRef.current = false;
  }, 2000);
}}
            placeholder="Type a message..."
            className="flex-1 rounded-lg bg-zinc-800 px-4 py-3 text-sm outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={mutation.isPending}
            className="rounded-lg bg-indigo-600 px-5 py-3 hover:bg-indigo-500 disabled:opacity-50"
          >
            {mutation.isPending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}