import { useOnlineCount } from "../../../lib/useOnlineCount";

export function OnlineBadge() {
  const count = useOnlineCount();

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <span className="text-sm text-gray-300">{count} online</span>
    </div>
  );
}