import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getServers } from "@/features/server/api/server-api";
import ServerActions from "@/features/server/components/server-actions";
import EditServerDialog from "@/features/server/components/edit-server-dialog";
import { getCurrentUser } from "@/features/auth/api/get-current-user"
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/features/auth/api/logout";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { deleteServer } from "@/features/server/api/delete-server";
import { useLongPress } from "@/hooks/use-long-press";
import { UserProfileCard } from "@/features/user/components/user-profile-card";
import { useRef } from "react";

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

interface ServerItemProps {
  server: { id: string; name: string; owner: { id: string; username: string } };
  isSelected: boolean;
  isOwner: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ServerItem({ server, isSelected, isOwner, onSelect, onEdit, onDelete }: ServerItemProps) {
  const [contextOpen, setContextOpen] = useState(false);
  

  const longPress = useLongPress({
    onLongPress: () => {
      if (isOwner) setContextOpen(true);
    },
  });

  return (
    <div className="relative group">
      <button
        onClick={() => {
          if (!longPress.didLongPress.current) onSelect();
        }}
        {...(isOwner ? {
          onTouchStart: longPress.onTouchStart,
          onTouchEnd: longPress.onTouchEnd,
          onTouchMove: longPress.onTouchMove,
        } : {})}
        className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg font-heading text-xs md:text-sm font-bold uppercase transition-all duration-200 ${
          isSelected
            ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-cyan-500/30 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(0,229,255,0.1)]"
        }`}
      >
        {server.name.charAt(0).toUpperCase()}
      </button>

      {isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="absolute -top-1 -right-1 hidden md:flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical className="h-3 w-3" />
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
                if (confirm("Delete this server?")) {
                  onDelete();
                }
              }}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {isOwner && contextOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/70"
          onClick={() => setContextOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl border-t border-cyan-500/10 bg-[#0a0f12] p-4 pb-8 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center font-heading text-xs uppercase tracking-[0.15em] text-cyan-400 mb-3">
              {server.name}
            </p>
            <button
              onClick={() => {
                setContextOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-zinc-300 hover:bg-zinc-800/60 transition"
            >
              <Pencil size={16} />
              <span>Edit Server</span>
            </button>
            <button
              onClick={() => {
                setContextOpen(false);
                if (confirm("Delete this server?")) {
                  onDelete();
                }
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-400 hover:bg-zinc-800/60 transition"
            >
              <Trash2 size={16} />
              <span>Delete Server</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServerSidebar({
     selectedServerId,
     onSelectServer,
}: ServerSidebarProps) {
  
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    serverId: string;
    serverName: string;
  }>({
    open: false,
    serverId: "",
    serverName: "",
  });
  const [profileCard, setProfileCard] = useState<{ userId: string; rect: DOMRect } | null>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);

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
console.log("RENDER — profileCard is:", profileCard);
  return (
    <aside className="flex h-full w-full flex-col items-center gap-3 border-r border-zinc-800/50 bg-[#080a0c] py-3">
      {/* Loading */}
      {isLoading && (
        <p className="text-xs text-zinc-600">...</p>
      )}

      {/* Error */}
      {isError && (
        <p className="text-center text-xs text-red-500">
          Error
        </p>
      )}

      {/* Servers */}
      {servers?.map((server) => (
        <ServerItem
          key={server.id}
          server={server}
          isSelected={selectedServerId === server.id}
          isOwner={user?.id === server.owner?.id}
          onSelect={() => onSelectServer(server.id)}
          onEdit={() =>
            setEditDialog({
              open: true,
              serverId: server.id,
              serverName: server.name,
            })
          }
          onDelete={() => deleteMutation.mutate(server.id)}
        />
      ))}
      <ServerActions />

      <button
  ref={avatarButtonRef}
  onClick={() => {
    console.log("user:", user);
    console.log("avatarButtonRef.current:", avatarButtonRef.current);
    if (!user || !avatarButtonRef.current) {
      console.log("BLOCKED by guard clause");
      return;
    }
    setProfileCard({
      userId: user.id,
      rect: avatarButtonRef.current.getBoundingClientRect(),
    });
    console.log("profileCard state should now be set");
  }}
  className="mt-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center overflow-hidden rounded-lg border border-cyan-500/20 bg-[#0a0f12] font-heading text-xs md:text-sm font-bold text-cyan-400 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all duration-200"
>
  {user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.username}
      className="h-full w-full object-cover"
    />
  ) : (
    user?.username?.[0]?.toUpperCase() ?? "?"
  )}
</button>

      {/* Edit Server Dialog */}
      {/* Edit Server Dialog */}
      <EditServerDialog
        serverId={editDialog.serverId}
        serverName={editDialog.serverName}
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog((prev) => ({ ...prev, open }))
        }
      />

      {profileCard && (
        <UserProfileCard
          userId={profileCard.userId}
          anchorRect={profileCard.rect}
          onClose={() => setProfileCard(null)}
          onLogout={() => logoutMutation.mutate()}
        />
      )}
    </aside>
  );
}