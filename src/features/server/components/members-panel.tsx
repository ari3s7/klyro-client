import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getServerMembers, type ServerMember } from "../api/get-server-members";
import { getServers } from "../api/server-api";
import type { Server } from "../types";
import { getCurrentUser } from "@/features/auth/api/get-current-user";
import { socket } from "@/lib/socket";
import { UserProfileCard } from "@/features/user/components/user-profile-card";

type MembersPanelProps = {
  serverId: string;
  onClose?: () => void;
};

function MemberRow({
  member,
  isOwner,
  isOnline,
  onClick,
}: {
  member: ServerMember;
  isOwner?: boolean;
  isOnline?: boolean;
  onClick: (rect: DOMRect) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      onClick={() => ref.current && onClick(ref.current.getBoundingClientRect())}
      className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left transition hover:bg-zinc-800/50"
    >
      <div className="relative shrink-0">
        <img
          src={
            member.avatar ||
            `https://api.dicebear.com/9.x/thumbs/svg?seed=${member.username}`
          }
          alt={member.username}
          className="h-9 w-9 rounded-sm border border-zinc-700/50 bg-zinc-800"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#080a0c] ${
            isOnline ? "bg-green-500" : "bg-zinc-600"
          }`}
        />
      </div>
      <div className="flex flex-col min-w-0 flex-1 justify-center">
        <span
          className={`truncate text-sm ${
            isOnline ? "text-zinc-200" : "text-zinc-500"
          }`}
        >
          {member.username}
        </span>
        {isOwner && (
          <span className="font-heading text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-400 leading-none mt-0.5">
            Owner
          </span>
        )}
      </div>
    </button>
  );
}

export function MembersPanel({ serverId, onClose }: MembersPanelProps) {
  const queryClient = useQueryClient();
  const [profileCard, setProfileCard] = useState<{ userId: string; rect: DOMRect } | null>(null);

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["servers"],
    queryFn: getServers,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

  const currentServer = servers.find((s) => s.id === serverId);
  const ownerId = currentServer?.owner?.id;

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["server-members", serverId],
    queryFn: () => getServerMembers(serverId),
    enabled: !!serverId,
  });

  useEffect(() => {
    function handleStatusChange({ userId, isOnline }: { userId: string; isOnline: boolean }) {
      queryClient.setQueryData<ServerMember[]>(["server-members", serverId], (old = []) =>
        old.map((m) => (m.id === userId ? { ...m, isOnline } : m))
      );
    }

    socket.on("user-status-changed", handleStatusChange);
    return () => {
      socket.off("user-status-changed", handleStatusChange);
    };
  }, [serverId, queryClient]);

  const online = members.filter((m) => m.isOnline || m.id === currentUser?.id);
  const offline = members.filter((m) => !m.isOnline && m.id !== currentUser?.id);
  const sorted = [...online, ...offline];

  return (
    <aside className="flex h-full w-full flex-col border-l border-zinc-800/50 bg-[#080a0c] p-3 md:w-60">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
          Members — {members.length}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-sm border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-[10px] text-zinc-300 md:hidden"
          >
            Close
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="px-2 text-xs text-zinc-600">Loading...</p>
      ) : (
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {sorted.map((member) => {
            const isOwner = Boolean(
              (ownerId && String(member.id) === String(ownerId)) ||
              (member.role && member.role.toUpperCase() === "OWNER")
            );
            const isOnline = member.isOnline || member.id === currentUser?.id;
            return (
              <MemberRow
                key={member.id}
                member={member}
                isOwner={isOwner}
                isOnline={isOnline}
                onClick={(rect) => setProfileCard({ userId: member.id, rect })}
              />
            );
          })}
        </div>
      )}

      {profileCard && (
        <UserProfileCard
          userId={profileCard.userId}
          anchorRect={profileCard.rect}
          onClose={() => setProfileCard(null)}
        />
      )}
    </aside>
  );
}