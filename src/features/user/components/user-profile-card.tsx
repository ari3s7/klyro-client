import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/get-user-profile";

type UserProfileCardProps = {
  userId: string;
  anchorRect: DOMRect;
  onClose: () => void;
};

export function UserProfileCard({ userId, anchorRect, onClose }: UserProfileCardProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfile(userId),
  });

  // Position the popover just below and to the right of the clicked avatar
  const style: React.CSSProperties = {
    position: "fixed",
    top: anchorRect.bottom + 8,
    left: anchorRect.left,
    zIndex: 100,
  };

  return (
    <>
      {/* Invisible backdrop to close on outside click */}
      <div className="fixed inset-0 z-90" onClick={onClose} />

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
              <div>
                <p className="font-heading text-sm font-bold uppercase tracking-[0.05em] text-zinc-200">
                  {profile.username}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {profile.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">{profile.bio}</p>
            )}
          </>
        )}
      </div>
    </>
  );
}