import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CreateChannelDialog from "@/features/channel/components/create-channel-dialog";
import EditChannelDialog from "@/features/channel/components/edit-channel-dialog";
import { getChannels } from "@/features/channel/api/channel-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteChannel } from "@/features/channel/api/delete-channel";
import { Hash, Mic, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Server } from "@/features/server/types";
import { OnlineBadge } from "@/features/dashboard/components/onlineBadge";
import { getCurrentUser } from "@/features/auth/api/get-current-user";
import { useLongPress } from "@/hooks/use-long-press";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface ChannelSidebarProps {
  selectedServer: Server | undefined;
  selectedServerId: string | null;
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export default function ChannelSidebar({
  selectedServer,
  selectedServerId,
  selectedChannelId,
  onSelectChannel,
}: ChannelSidebarProps) {
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    channelId: string;
    channelName: string;
    channelType: "TEXT" | "VOICE";
  }>({
    open: false,
    channelId: "",
    channelName: "",
    channelType: "TEXT",
  });

  const [mobileContext, setMobileContext] = useState<{
    open: boolean;
    channelId: string;
    channelName: string;
    channelType: "TEXT" | "VOICE";
  }>({
    open: false,
    channelId: "",
    channelName: "",
    channelType: "TEXT",
  });

  const {
    data: channels = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["channels", selectedServerId],
    queryFn: () => getChannels(selectedServerId!),
    enabled: !!selectedServerId,
  });

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

  const isOwner = user?.id === selectedServer?.owner?.id;

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channels", selectedServerId],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  if (!selectedServerId) {
    return (
      <aside className="flex w-full flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-4">
          <h2 className="font-semibold">Select a Server</h2>
        </div>

        <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          Select a server to view channels.
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-full flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Header */}
<div className="border-b border-zinc-800 p-4">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <h2 className="text-lg font-semibold text-white">
        {selectedServer?.name}
      </h2>
       <OnlineBadge />

      <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2">
        <div>
          <p className="text-xs text-zinc-400">
            Invite Code
          </p>

          <p className="font-mono text-sm tracking-wider text-white">
            {selectedServer?.inviteCode}
          </p>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(selectedServer!.inviteCode);
          }}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Copy
        </button>
      </div>
    </div>

    {selectedServerId && isOwner && (
      <div className="ml-3 mt-1">
        <CreateChannelDialog serverId={selectedServerId} />
      </div>
    )}
  </div>
</div>
      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <p className="px-2 py-3 text-sm text-zinc-400">
            Loading...
          </p>
        )}

        {isError && (
          <p className="px-2 py-3 text-sm text-red-500">
            Failed to load channels.
          </p>
        )}

        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isSelected={selectedChannelId === channel.id}
            isOwner={isOwner}
            onSelect={() => onSelectChannel(channel.id)}
            onEdit={() =>
              setEditDialog({
                open: true,
                channelId: channel.id,
                channelName: channel.name,
                channelType: channel.type,
              })
            }
            onDelete={() => deleteMutation.mutate(channel.id)}
            onMobileLongPress={() =>
              setMobileContext({
                open: true,
                channelId: channel.id,
                channelName: channel.name,
                channelType: channel.type,
              })
            }
          />
        ))}

        {!isLoading && channels?.length === 0 && (
          <p className="px-2 py-3 text-sm text-zinc-500">
            No channels found.
          </p>
        )}
      </div>

      {/* Mobile: long press context menu */}
      {mobileContext.open && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setMobileContext((prev) => ({ ...prev, open: false }))}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-zinc-800 p-4 pb-8 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-sm text-zinc-400 mb-3">
              {mobileContext.channelName}
            </p>
            <button
              onClick={() => {
                setMobileContext((prev) => ({ ...prev, open: false }));
                setEditDialog({
                  open: true,
                  channelId: mobileContext.channelId,
                  channelName: mobileContext.channelName,
                  channelType: mobileContext.channelType,
                });
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-white hover:bg-zinc-700 transition"
            >
              <Pencil size={16} />
              <span>Edit Channel</span>
            </button>
            <button
              onClick={() => {
                setMobileContext((prev) => ({ ...prev, open: false }));
                deleteMutation.mutate(mobileContext.channelId);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-400 hover:bg-zinc-700 transition"
            >
              <Trash2 size={16} />
              <span>Delete Channel</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Channel Dialog */}
      {selectedServerId && (
        <EditChannelDialog
          serverId={selectedServerId}
          channelId={editDialog.channelId}
          channelName={editDialog.channelName}
          channelType={editDialog.channelType}
          open={editDialog.open}
          onOpenChange={(open) =>
            setEditDialog((prev) => ({ ...prev, open }))
          }
        />
      )}
    </aside>
  );
}

// ── Channel item with long press + hover ⋮ ──

interface ChannelItemProps {
  channel: { id: string; name: string; type: "TEXT" | "VOICE" };
  isSelected: boolean;
  isOwner: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMobileLongPress: () => void;
}

function ChannelItem({
  channel,
  isSelected,
  isOwner,
  onSelect,
  onEdit,
  onDelete,
  onMobileLongPress,
}: ChannelItemProps) {
  const longPress = useLongPress({
    onLongPress: () => {
      if (isOwner) onMobileLongPress();
    },
  });

  return (
    <button
      onClick={() => {
        if (!longPress.didLongPress.current) onSelect();
      }}
      {...(isOwner ? {
        onTouchStart: longPress.onTouchStart,
        onTouchEnd: longPress.onTouchEnd,
        onTouchMove: longPress.onTouchMove,
      } : {})}
      className={`group relative w-full rounded-lg px-3 py-3 md:py-2 text-left transition ${
        isSelected
          ? "bg-zinc-700 text-white"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          {channel.type === "TEXT" ? (
            <Hash size={16} />
          ) : (
            <Mic size={16} />
          )}
          <span>{channel.name}</span>
        </div>

        {/* Desktop: hover ⋮ icon (owner only) */}
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="hidden md:block rounded p-1 text-zinc-400 transition hover:bg-zinc-700 hover:text-white opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={14} />
            </DropdownMenuTrigger>

            <DropdownMenuContent side="right" align="start" sideOffset={8}>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil size={14} />
                <span>Edit</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </button>
  );
}