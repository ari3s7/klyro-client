import { useQuery } from "@tanstack/react-query";
import CreateChannelDialog from "@/features/channel/components/create-channel-dialog";
import { getChannels } from "@/features/channel/api/channel-api";

interface ChannelSidebarProps {
  selectedServerId: string | null;
}

export default function ChannelSidebar({
  selectedServerId,
}: ChannelSidebarProps) {
  const {
    data: channels,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["channels", selectedServerId],
    queryFn: () => getChannels(selectedServerId!),
    enabled: !!selectedServerId,
  });

  if (!selectedServerId) {
    return (
      <aside className="flex w-72 flex-col border-r border-zinc-800 bg-zinc-900">
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
    <aside className="flex w-72 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between">
  <h2 className="font-semibold">Channels</h2>

  {selectedServerId && (
    <CreateChannelDialog
      serverId={selectedServerId}
    />
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

        {channels?.map((channel) => (
          <button
            key={channel.id}
            className="mb-1 flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            # {channel.name}
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