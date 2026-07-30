import { useEffect, useState, useRef } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Paperclip,
  X,
  Loader2,
  Image as ImageIcon,
  Film,
  Reply,
  CornerDownRight,
  ArrowLeft,
} from "lucide-react";
import { deleteMessage } from "@/features/message/api/delete-message";
import { UserProfileCard } from "@/features/user/components/user-profile-card";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getCurrentUser } from "@/features/auth/api/get-current-user";
import { useLongPress } from "@/hooks/use-long-press";

import { socket } from "@/lib/socket";

import {
  getMessages,
  sendMessage,
  editMessage,
  uploadFile,
} from "@/features/message/api/message-api";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Attachment, Message } from "@/features/message/types";

interface ChatAreaProps {
  selectedChannelId: string | null;
  onBack?: () => void;
}

export default function ChatArea({
  selectedChannelId,
  onBack,
}: ChatAreaProps) {
  const [content, setContent] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [profileCard, setProfileCard] = useState<{ userId: string; rect: DOMRect } | null>(null);

  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [mobileActionMessage, setMobileActionMessage] = useState<Message | null>(null);

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

    const handleMessageDeleted = ({ id, deletedAt }: { id: string; deletedAt: string }) => {
      queryClient.setQueryData<Message[]>(
        ["messages", selectedChannelId],
        (old = []) =>
          old.map((m) =>
            m.id === id ? { ...m, deletedAt, content: null, attachments: [] } : m
          )
      );
    };

    const handleMessageUpdated = (updated: Message) => {
      queryClient.setQueryData<Message[]>(
        ["messages", selectedChannelId],
        (old = []) =>
          old.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
      );
    };

    const handleTypingStart = ({ username }: { username: string }) => {
      setTypingUser(username);
    };

    const handleTypingStop = () => {
      setTypingUser(null);
    };

    socket.on("message-created", handleNewMessage);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("message-updated", handleMessageUpdated);
    socket.on("typing-start", handleTypingStart);
    socket.on("typing-stop", handleTypingStop);

    return () => {
      socket.off("message-created", handleNewMessage);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("message-updated", handleMessageUpdated);
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
    mutationFn: (data: { content?: string; attachments?: Attachment[]; parentId?: string }) =>
      sendMessage(selectedChannelId!, data),

    onSuccess: () => {
      setContent("");
      setPendingAttachment(null);
      setReplyingTo(null);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadFile(file);
      setPendingAttachment({
        url: res.url,
        fileName: res.fileName,
        mimeType: res.mimeType,
        size: res.size,
      });
    } catch (err) {
      console.error("Failed to upload media:", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startReply = (message: Message) => {
    setReplyingTo(message);
    setMobileActionMessage(null);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleSend = () => {
    if (!selectedChannelId) return;
    if (!content.trim() && !pendingAttachment) return;

    mutation.mutate({
      content: content.trim() || undefined,
      attachments: pendingAttachment ? [pendingAttachment] : undefined,
      parentId: replyingTo?.id,
    });
  };

  const startEdit = (message: Message) => {
    setEditingId(message.id);
    setEditContent(message.content || "");
    setMobileActionMessage(null);
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
    setMobileActionMessage(null);
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
      <header className="flex h-14 items-center border-b border-zinc-800/50 px-4 md:px-6">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-3 rounded-sm p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden transition"
            title="Back to channels"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h2 className="font-heading text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Channel Chat</h2>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3 md:p-6">
        {isLoading ? (
          <p className="text-xs text-zinc-600">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-zinc-700">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              user={user}
              editingId={editingId}
              editContent={editContent}
              editMutationPending={editMutation.isPending}
              setEditContent={setEditContent}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              startReply={startReply}
              startEdit={startEdit}
              handleDelete={handleDelete}
              setProfileCard={setProfileCard}
              onOpenMobileMenu={() => setMobileActionMessage(message)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/50 p-3 md:p-4 bg-[#06080a]">
        {typingUser && (
          <p className="mb-2 text-xs italic text-cyan-500/60">
            {typingUser} is typing...
          </p>
        )}

        {/* Reply preview banner */}
        {replyingTo && (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-300">
            <Reply size={14} className="shrink-0 text-cyan-400" />
            <span className="truncate min-w-0 flex-1">
              Replying to <span className="font-bold">{replyingTo.sender.username}</span>
              {replyingTo.content && (
                <span className="ml-1.5 text-zinc-500">— {replyingTo.content.slice(0, 60)}{replyingTo.content.length > 60 ? "..." : ""}</span>
              )}
            </span>
            <button
              onClick={cancelReply}
              className="ml-auto shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              title="Cancel reply"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Attachment preview banner */}
        {pendingAttachment && (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-300">
            {pendingAttachment.mimeType.startsWith("video/") ? (
              <Film size={14} className="shrink-0 text-cyan-400" />
            ) : (
              <ImageIcon size={14} className="shrink-0 text-cyan-400" />
            )}
            <span className="truncate font-medium">{pendingAttachment.fileName}</span>
            <button
              onClick={() => setPendingAttachment(null)}
              className="ml-auto rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              title="Remove attachment"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-2.5 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Attach image or video"
            className="flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/10 active:scale-95 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 size={18} className="animate-spin text-cyan-400" />
            ) : (
              <Paperclip size={18} />
            )}
          </button>

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
            placeholder="Type a message or attach media..."
            className="flex-1 rounded-sm border border-zinc-800 bg-zinc-900/40 px-3.5 py-2.5 md:px-4 md:py-3 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-500/30 focus:shadow-[0_0_15px_rgba(0,229,255,0.05)]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={mutation.isPending || isUploading || (!content.trim() && !pendingAttachment)}
            className="rounded-sm bg-cyan-400 px-4 py-2.5 md:px-5 md:py-3 font-heading text-xs font-bold uppercase tracking-[0.1em] text-black transition-all duration-200 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] active:scale-95 disabled:opacity-50 shrink-0"
          >
            {mutation.isPending ? "..." : "Send"}
          </button>
        </div>
      </div>

      {profileCard && (
        <UserProfileCard
          userId={profileCard.userId}
          anchorRect={profileCard.rect}
          onClose={() => setProfileCard(null)}
        />
      )}

      {/* Mobile action modal sheet */}
      {mobileActionMessage && !mobileActionMessage.deletedAt && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs md:hidden" onClick={() => setMobileActionMessage(null)}>
          <div className="w-full rounded-t-lg border-t border-zinc-800 bg-zinc-950 p-4 space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="w-8 h-1 bg-zinc-800 rounded-full mx-auto mb-3" />
            <p className="text-[11px] font-heading uppercase text-zinc-500 tracking-wider mb-2">Message Actions</p>

            <button
              onClick={() => startReply(mobileActionMessage)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 rounded-sm"
            >
              <Reply size={16} className="text-cyan-400" />
              <span>Reply</span>
            </button>

            {mobileActionMessage.sender.id === user?.id && (
              <>
                <button
                  onClick={() => startEdit(mobileActionMessage)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 rounded-sm"
                >
                  <Pencil size={16} className="text-zinc-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(mobileActionMessage.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded-sm"
                >
                  <Trash2 size={16} className="text-red-400" />
                  <span>Delete</span>
                </button>
              </>
            )}

            <button
              onClick={() => setMobileActionMessage(null)}
              className="w-full mt-2 py-2.5 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

interface MessageRowProps {
  message: Message;
  user?: { id: string; username: string } | null;
  editingId: string | null;
  editContent: string;
  editMutationPending: boolean;
  setEditContent: (val: string) => void;
  saveEdit: (id: string) => void;
  cancelEdit: () => void;
  startReply: (m: Message) => void;
  startEdit: (m: Message) => void;
  handleDelete: (id: string) => void;
  setProfileCard: (val: { userId: string; rect: DOMRect } | null) => void;
  onOpenMobileMenu: () => void;
}

function MessageRow({
  message,
  user,
  editingId,
  editContent,
  editMutationPending,
  setEditContent,
  saveEdit,
  cancelEdit,
  startReply,
  startEdit,
  handleDelete,
  setProfileCard,
  onOpenMobileMenu,
}: MessageRowProps) {
  const longPressProps = useLongPress({
    onLongPress: () => {
      if (!message.deletedAt) {
        onOpenMobileMenu();
      }
    },
    delay: 400,
  });

  return (
    <div
      {...longPressProps}
      className="group relative flex gap-3 rounded-sm border border-zinc-800/30 bg-zinc-900/30 p-3 transition-colors hover:border-zinc-800/50"
    >
      <img
        src={
          message.sender.avatar ||
          `https://api.dicebear.com/9.x/thumbs/svg?seed=${message.sender.username}`
        }
        alt={message.sender.username}
        onClick={(e) =>
          setProfileCard({
            userId: message.sender.id,
            rect: e.currentTarget.getBoundingClientRect(),
          })
        }
        className="h-8 w-8 shrink-0 cursor-pointer rounded-sm bg-zinc-800 border border-zinc-700/50 transition hover:border-cyan-500/40"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.05em] text-zinc-300 truncate mr-2">
            {message.sender.username}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-zinc-600">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {!message.deletedAt && editingId !== message.id && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="rounded p-1 text-zinc-500 hover:text-cyan-400 transition opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <MoreVertical size={15} />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => startReply(message)}
                  >
                    <Reply size={14} className="mr-2 text-cyan-400" />
                    Reply
                  </DropdownMenuItem>

                  {message.sender.id === user?.id && (
                    <>
                      <DropdownMenuSeparator />

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
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {message.deletedAt ? (
          <div className="mt-1 flex items-center gap-1.5 text-xs italic text-zinc-500 bg-zinc-900/40 border border-zinc-800/40 px-2.5 py-1.5 rounded-sm max-w-fit">
            <Trash2 size={12} className="shrink-0 text-zinc-600" />
            <span>This message was deleted</span>
          </div>
        ) : editingId === message.id ? (
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
                disabled={editMutationPending}
                className="rounded-sm bg-cyan-400 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:bg-cyan-300 disabled:opacity-50"
              >
                {editMutationPending ? "Saving..." : "Save"}
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
          <>
            {message.parent && (
              <div
                className="mt-1.5 mb-1 flex items-start gap-2 rounded-sm border-l-2 border-cyan-500/40 bg-cyan-950/10 px-3 py-1.5 cursor-pointer transition hover:bg-cyan-950/20"
              >
                <CornerDownRight size={12} className="mt-0.5 shrink-0 text-cyan-500/50" />
                <div className="min-w-0">
                  <p className="font-heading text-[10px] font-bold uppercase tracking-[0.05em] text-cyan-400/70">
                    {message.parent.sender.username}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {message.parent.content || "[attachment]"}
                  </p>
                </div>
              </div>
            )}

            {message.content && (
              <p className="mt-1 text-sm leading-relaxed text-zinc-300 break-words">
                {message.content}
              </p>
            )}

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-3">
                {message.attachments.map((att, idx) => {
                  const isVideo = att.mimeType?.startsWith("video/") || att.url.endsWith(".mp4") || att.url.endsWith(".webm");
                  return isVideo ? (
                    <div key={att.id || idx} className="relative overflow-hidden rounded-md border border-cyan-500/30 bg-black/60 shadow-[0_0_15px_rgba(0,0,0,0.5)] max-w-full">
                      <video
                        src={att.url}
                        controls
                        className="max-h-72 max-w-full md:max-w-md rounded-md object-contain"
                      />
                    </div>
                  ) : (
                    <div key={att.id || idx} className="group/img relative overflow-hidden rounded-md border border-cyan-500/30 bg-zinc-950/60 shadow-[0_0_15px_rgba(0,0,0,0.5)] max-w-full">
                      <img
                        src={att.url}
                        alt={att.fileName || "Uploaded media"}
                        className="max-h-72 max-w-full md:max-w-md rounded-md object-cover transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-[0.99]"
                        onClick={() => window.open(att.url, "_blank")}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}