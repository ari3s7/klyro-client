import { useQuery } from "@tanstack/react-query";
import { getServers } from "@/features/server/api/server-api";
import CreateServerDialog from "@/features/server/components/create-server-dialog";

interface ServerSidebarProps {
  selectedServerId: string | null;
  onSelectServer: (serverId: string) => void;
}

export default function ServerSidebar({
     selectedServerId,
     onSelectServer,
}: ServerSidebarProps) {
  const {
    data: servers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["servers"],
    queryFn: getServers,
  });

  

  return (
    <aside className="flex w-20 flex-col items-center gap-3 border-r border-zinc-800 bg-zinc-900 py-4">
      {/* Loading */}
      {isLoading && (
        <p className="text-xs text-zinc-400">...</p>
      )}

      {/* Error */}
      {isError && (
        <p className="text-center text-xs text-red-500">
          Error
        </p>
      )}

      {/* Servers */}
      {servers?.map((server) => (
  <button
    key={server.id}
    onClick={() => onSelectServer(server.id)}
    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold transition
      ${
        selectedServerId === server.id
          ? "bg-indigo-600"
          : "bg-zinc-800 hover:bg-indigo-600"
      }`}
  >
    {server.name.charAt(0).toUpperCase()}
  </button>
))}

      {/* Create Server */}
      <CreateServerDialog />

      {/* User Avatar (placeholder) */}
      <div className="mt-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
        A
      </div>
    </aside>
  );
}