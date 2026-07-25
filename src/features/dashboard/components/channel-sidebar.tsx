import { useQuery } from "@tanstack/react-query";
import CreateChannelDialog from "@/features/channel/components/create-channel-dialog";
import { getChannels } from "@/features/channel/api/channel-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteChannel } from "@/features/channel/api/delete-channel";
import { Trash2 } from "lucide-react";
import type { Server } from "@/features/server/types";

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
  const {
    data: channels = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["channels", selectedServerId],
    queryFn: () => getChannels(selectedServerId!),
    enabled: !!selectedServerId,
  });

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
      {/* Header */}
<div className="border-b border-zinc-800 p-4">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <h2 className="text-lg font-semibold text-white">
        {selectedServer?.name}
      </h2>

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

    {selectedServerId && (
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
  <button
    key={channel.id}
    onClick={() => onSelectChannel(channel.id)}
    className={`group relative w-full rounded-lg px-3 py-3 md:py-2 text-left transition ${
      selectedChannelId === channel.id
        ? "bg-zinc-700 text-white"
        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
    }`}
  >
    <div className="flex w-full items-center justify-between">
  <span># {channel.name}</span>

   <button
    onClick={(e) => {
      e.stopPropagation();
      deleteMutation.mutate(channel.id);
    }}
    className="block rounded p-1 text-red-400 transition hover:bg-zinc-700 hover:text-red-300 md:opacity-0 md:group-hover:opacity-100"
  >
    <Trash2 size={14} />
  </button>
</div>
  </button>
))}

        {!isLoading && channels?.length === 0 && (
          <p className="px-2 py-3 text-sm text-zinc-500">
            No channels found.
          </p>
        )}
      </div>
    </aside>
  );
}