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

  const isOwnProfile = currentUser?.id === userId;

  const mutation = useMutation({
    mutationFn: (bio: string) => updateUserProfile({ bio }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-profile", userId], updated);
      setIsEditing(false);
    },
  });

  const style: React.CSSProperties = {
    position: "fixed",
    top: anchorRect.bottom + 8,
    left: anchorRect.left,
    zIndex: 100,
  };

  const startEditing = () => {
    setBioDraft(profile?.bio || "");
    setIsEditing(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />

      <div
        style={style}
        className="w-64 rounded-sm border border-zinc-800 bg-zinc-900/95 p-4 shadow-xl backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !profile ? (
          <p className="text-xs text-zinc-500">Loading...</p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    profile.avatar ||
                    `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.username}`
                  }
                  alt={profile.username}
                  className="h-12 w-12 rounded-sm border border-zinc-700 bg-zinc-800"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-900 ${
                    profile.isOnline ? "bg-green-500" : "bg-zinc-600"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-bold uppercase tracking-[0.05em] text-zinc-200">
                  {profile.username}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {profile.isOnline ? "Online" : "Offline"}
                </p>
              </div>
              {isOwnProfile && !isEditing && (
                <button
                  onClick={startEditing}
                  className="shrink-0 rounded-sm border border-zinc-700 p-1.5 text-zinc-400 transition hover:border-cyan-500/40 hover:text-cyan-400"
                >
                  <Pencil size={12} />
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
                  className="w-full resize-none rounded-sm border border-zinc-700 bg-zinc-900/60 px-2 py-2 text-xs text-zinc-200 outline-none transition-all focus:border-cyan-500/40"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => mutation.mutate(bioDraft)}
                    disabled={mutation.isPending}
                    className="rounded-sm bg-cyan-400 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {mutation.isPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-sm border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-400 transition hover:border-zinc-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              profile.bio && (
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">{profile.bio}</p>
              )
            )}

            {!isEditing && !profile.bio && isOwnProfile && (
              <button
                onClick={startEditing}
                className="mt-3 text-xs italic text-zinc-600 hover:text-cyan-400"
              >
                Add a bio...
              </button>
            )}

            {isOwnProfile && onLogout && !isEditing && (
              <>
                <div className="my-3 border-t border-zinc-800" />
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-xs text-red-500 transition hover:bg-red-500/10 hover:text-red-400"
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