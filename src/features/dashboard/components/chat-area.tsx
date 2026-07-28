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
      <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#050505] text-zinc-600">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/[0.08] via-transparent to-teal-950/[0.05]" />
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
        <div className="relative z-10 text-center">
          <p className="font-heading text-xs uppercase tracking-[0.2em]">No channel selected</p>
          <p className="mt-2 text-xs text-zinc-700">Select a channel to start chatting.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-[#050505]">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-950/[0.06] via-transparent to-teal-950/[0.04]" />
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.02] blur-[120px]" />

      {/* Header */}
      <header className="flex h-14 items-center border-b border-zinc-800/50 px-6">
        <h2 className="font-heading text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Channel Chat</h2>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6">
        {isLoading ? (
          <p className="text-xs text-zinc-600">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-zinc-700">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="group relative flex gap-3 rounded-sm border border-zinc-800/30 bg-zinc-900/30 p-3 transition-colors hover:border-zinc-800/50"
            >
              <img
    src={
      message.sender.avatar ||
      `https://api.dicebear.com/9.x/thumbs/svg?seed=${message.sender.username}`
    }
    alt={message.sender.username}
    className="h-8 w-8 shrink-0 rounded-sm bg-zinc-800 border border-zinc-700/50"
  />
              <div className="flex-1">
    <div className="flex items-center justify-between">
      <p className="font-heading text-xs font-bold uppercase tracking-[0.05em] text-zinc-300">
        {message.sender.username}
      </p>

  <div className="flex items-center gap-2">
    <span className="text-[10px] text-zinc-600">
      {new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>

    {message.sender.id === user?.id && editingId !== message.id && (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button className="rounded p-1 text-zinc-600 opacity-100 transition hover:text-cyan-400 md:opacity-0 md:group-hover:opacity-100">
            <MoreVertical size={14} />
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
      className="w-full resize-none rounded-sm border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 outline-none transition-all focus:border-cyan-500/40"
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
        className="rounded-sm bg-cyan-400 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:bg-cyan-300 disabled:opacity-50"
      >
        {editMutation.isPending ? "Saving..." : "Save"}
      </button>

      <button
        onClick={cancelEdit}
        className="rounded-sm border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-400 transition hover:border-zinc-600"
      >
        Cancel
      </button>
    </div>
  </div>
) : (
  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
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
      <div className="border-t border-zinc-800/50 p-4">
        {typingUser && (
  <p className="mb-2 text-xs italic text-cyan-500/60">
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
            className="flex-1 rounded-sm border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-500/30 focus:shadow-[0_0_15px_rgba(0,229,255,0.05)]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={mutation.isPending}
            className="rounded-sm bg-cyan-400 px-5 py-3 font-heading text-xs font-bold uppercase tracking-[0.1em] text-black transition-all duration-200 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] disabled:opacity-50"
          >
            {mutation.isPending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}