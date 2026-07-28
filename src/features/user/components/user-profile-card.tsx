import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Pencil, LogOut } from "lucide-react";
import { getUserProfile } from "../api/get-user-profile";
import { updateUserProfile } from "../api/update-user-profile";
import { getCurrentUser } from "@/features/auth/api/get-current-user";

type UserProfileCardProps = {
  userId: string;
  anchorRect: DOMRect;
  onClose: () => void;
  onLogout?: () => void;
};

export function UserProfileCard({ userId, anchorRect, onClose, onLogout }: UserProfileCardProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfile(userId),
  });

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

  const isOwnProfile = Boolean(currentUser?.id && userId && String(currentUser.id) === String(userId));

  const mutation = useMutation({
    mutationFn: (bio: string) => updateUserProfile({ bio }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-profile", userId], updated);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      setIsEditing(false);
    },
  });

  // Intelligent positioning logic to stay inside viewport on desktop and mobile
  const isLeftSidebar = anchorRect.left < 100;
  const cardWidth = Math.min(272, window.innerWidth - 32);
  const estimatedHeight = 280;

  let left = anchorRect.left;
  let top = anchorRect.bottom + 8;

  if (isLeftSidebar) {
    left = Math.max(16, Math.min(anchorRect.right + 10, window.innerWidth - cardWidth - 16));
    if (anchorRect.bottom > window.innerHeight - estimatedHeight) {
      top = Math.max(16, window.innerHeight - estimatedHeight - 16);
    } else {
      top = Math.max(16, anchorRect.top);
    }
  } else {
    if (left + cardWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - cardWidth - 16);
    }
    if (top + estimatedHeight > window.innerHeight - 16) {
      top = Math.max(16, anchorRect.top - estimatedHeight - 8);
    }
  }

  const style: React.CSSProperties = {
    position: "fixed",
    top,
    left,
    zIndex: 100,
  };

  const startEditing = () => {
    setBioDraft(profile?.bio || "");
    setIsEditing(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none" onClick={onClose} />

      <div
        style={style}
        className="w-[272px] max-w-[calc(100vw-32px)] rounded-lg border border-cyan-500/30 bg-[#0a0f12]/95 p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !profile ? (
          <p className="text-xs text-zinc-500">Loading...</p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={
                    profile.avatar ||
                    `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.username}`
                  }
                  alt={profile.username}
                  className="h-12 w-12 rounded-sm border border-zinc-700 bg-zinc-800 object-cover"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0f12] ${
                    profile.isOnline ? "bg-green-500" : "bg-zinc-600"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-bold uppercase tracking-[0.05em] text-zinc-200 truncate">
                  {profile.username}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {profile.isOnline ? "Online" : "Offline"}
                </p>
              </div>
              {isOwnProfile && !isEditing && (
                <button
                  onClick={startEditing}
                  title="Edit bio"
                  className="shrink-0 rounded-sm border border-zinc-700/80 p-2 text-zinc-400 transition hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10 active:scale-95"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-3 flex flex-col gap-2">
                <textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  autoFocus
                  rows={3}
                  maxLength={190}
                  placeholder="Write something about yourself..."
                  className="w-full resize-none rounded-sm border border-zinc-700 bg-zinc-900/90 px-2.5 py-2 text-xs text-zinc-200 outline-none transition-all focus:border-cyan-500/50 focus:shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => mutation.mutate(bioDraft)}
                    disabled={mutation.isPending}
                    className="rounded-sm bg-cyan-400 px-3.5 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:bg-cyan-300 active:scale-95 disabled:opacity-50"
                  >
                    {mutation.isPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-sm border border-zinc-700 bg-zinc-800/60 px-3.5 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-600 active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : profile.bio ? (
              <div className="mt-3 rounded-sm border border-zinc-800/60 bg-zinc-900/40 p-2.5">
                <p className="text-xs leading-relaxed text-zinc-300 break-words">{profile.bio}</p>
              </div>
            ) : isOwnProfile ? (
              <button
                onClick={startEditing}
                className="mt-3 flex items-center gap-1.5 text-xs italic text-cyan-500/80 transition hover:text-cyan-400 hover:underline active:opacity-75"
              >
                <Pencil size={12} />
                <span>Add a bio...</span>
              </button>
            ) : null}

            {isOwnProfile && onLogout && !isEditing && (
              <>
                <div className="my-3 border-t border-zinc-800/80" />
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 active:bg-red-500/20"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}