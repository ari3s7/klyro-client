import { useQuery } from "@tanstack/react-query";
import { getServers } from "@/features/server/api/server-api";
import ServerActions from "@/features/server/components/server-actions";
import { getCurrentUser } from "@/features/auth/api/get-current-user"
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/features/auth/api/logout";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { deleteServer } from "@/features/server/api/delete-server";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const { data: user } = useQuery({
  queryKey: ["current-user"],
  queryFn: getCurrentUser,
});

const queryClient = useQueryClient();

const deleteMutation = useMutation({
  mutationFn: deleteServer,

  onSuccess: async () => {
   await queryClient.invalidateQueries({
      queryKey: ["servers"],
    });
  },

  onError: (error) => {
    console.error(error);
  },
});

const navigate = useNavigate();

const logoutMutation = useMutation({
  mutationFn: logout,

  onSuccess: async () => {
  await queryClient.invalidateQueries({
    queryKey: ["me"],
  });

  queryClient.removeQueries({
    queryKey: ["me"],
  });

  navigate("/login", { replace: true });
},
});
  return (
    <aside className="flex h-full w-full flex-col items-center gap-3 border-r border-zinc-800 bg-zinc-900 py-3">
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
  <div key={server.id} className="relative group">
    <button
      onClick={() => onSelectServer(server.id)}
      className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl text-base md:text-lg font-semibold transition ${
        selectedServerId === server.id
          ? "bg-indigo-600"
          : "bg-zinc-800 hover:bg-indigo-600"
      }`}
    >
      {server.name.charAt(0).toUpperCase()}
    </button>

    {selectedServerId === server.id && (
      <button
        onClick={(e) => {
          e.stopPropagation();

          if (confirm("Delete this server?")) {
            deleteMutation.mutate(server.id);
          }
        }}
        className="absolute -top-1 -right-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white group-hover:flex hover:bg-red-700"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    )}
  </div>
))}
      <ServerActions />

      <DropdownMenu>
  <DropdownMenuTrigger >
    <button className="mt-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-indigo-600 text-base md:text-lg font-semibold text-white hover:bg-indigo-500 transition">
      {user?.username?.[0]?.toUpperCase() ?? "?"}
    </button>
  </DropdownMenuTrigger>

  <DropdownMenuContent side="right" align="end">
    <DropdownMenuItem>
      {user?.username}
    </DropdownMenuItem>

    <DropdownMenuSeparator />

    <DropdownMenuItem
      className="text-red-500 cursor-pointer"
      onClick={() => logoutMutation.mutate()}
    >
      Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
    </aside>
  );
}